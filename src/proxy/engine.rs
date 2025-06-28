use crate::config::{ForwardingRule, ContentSource};
use crate::content::ContentManager;
use crate::proxy::{ProxyRouter, RoundRobinManager};
use axum::extract::Request;
use axum::http::{HeaderName, HeaderValue, Method};
use axum::response::Response;
use std::str::FromStr;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{error, info, warn};

#[derive(Debug, Clone)]
pub struct ProxyEngine {
    router: Arc<RwLock<ProxyRouter>>,
    round_robin: Arc<RoundRobinManager>,
    content_manager: Arc<ContentManager>,
    client: reqwest::Client,
}

impl ProxyEngine {
    pub fn new() -> Self {
        Self {
            router: Arc::new(RwLock::new(ProxyRouter::new())),
            round_robin: Arc::new(RoundRobinManager::new()),
            content_manager: Arc::new(ContentManager::new()),
            client: reqwest::Client::new(),
        }
    }

    pub async fn update_rules(&self, rules: Vec<ForwardingRule>) -> anyhow::Result<()> {
        let mut router = self.router.write().await;
        router.update_rules(rules)?;
        self.round_robin.clear_content_selectors();
        Ok(())
    }

    pub async fn handle_request(&self, mut request: Request) -> Result<Response, axum::http::StatusCode> {
        let path = request.uri().path();
        
        let rule = {
            let router = self.router.read().await;
            match router.find_matching_rule(path) {
                Some(rule) => rule.clone(),
                None => {
                    warn!("No matching rule found for path: {}", path);
                    return Err(axum::http::StatusCode::NOT_FOUND);
                }
            }
        };

        info!("Processing request for path: {} using rule: {}", path, rule.name);

        if let Err(e) = self.apply_replacements(&mut request, &rule).await {
            error!("Failed to apply replacements: {}", e);
            return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR);
        }

        let target_url = match self.round_robin.select_target_url(&rule.target_urls) {
            Some(url) => url,
            None => {
                error!("No target URLs available for rule: {}", rule.name);
                return Err(axum::http::StatusCode::SERVICE_UNAVAILABLE);
            }
        };

        match self.forward_request(request, &target_url).await {
            Ok(response) => Ok(response),
            Err(e) => {
                error!("Failed to forward request to {}: {}", target_url, e);
                Err(axum::http::StatusCode::BAD_GATEWAY)
            }
        }
    }

    async fn apply_replacements(&self, request: &mut Request, rule: &ForwardingRule) -> anyhow::Result<()> {
        self.apply_header_replacements(request, rule).await?;
        self.apply_body_replacements(request, rule).await?;
        Ok(())
    }

    async fn apply_header_replacements(&self, request: &mut Request, rule: &ForwardingRule) -> anyhow::Result<()> {
        let headers = request.headers_mut();
        
        for (header_name, content_source) in &rule.header_replacements {
            let content = self.content_manager.get_content(content_source).await?;
            
            if let Some(replacement) = self.round_robin.select_replacement_content(
                &format!("{}:{}", rule.name, header_name),
                &content
            ) {
                if let (Ok(name), Ok(value)) = (
                    HeaderName::from_str(header_name),
                    HeaderValue::from_str(&replacement)
                ) {
                    headers.insert(name, value);
                } else {
                    warn!("Invalid header name or value: {} = {}", header_name, replacement);
                }
            }
        }

        Ok(())
    }

    async fn apply_body_replacements(&self, request: &mut Request, rule: &ForwardingRule) -> anyhow::Result<()> {
        if rule.body_replacements.is_empty() {
            return Ok(());
        }

        let body = std::mem::replace(request.body_mut(), axum::body::Body::empty());
        let body_bytes = axum::body::to_bytes(body, usize::MAX).await
            .map_err(|e| anyhow::anyhow!("Failed to read request body: {}", e))?;
        
        let mut body_string = String::from_utf8_lossy(&body_bytes).to_string();

        for (pattern, content_source) in &rule.body_replacements {
            let content = self.content_manager.get_content(content_source).await?;
            
            if let Some(replacement) = self.round_robin.select_replacement_content(
                &format!("{}:body:{}", rule.name, pattern),
                &content
            ) {
                body_string = body_string.replace(pattern, &replacement);
            }
        }

        *request.body_mut() = axum::body::Body::from(body_string);
        Ok(())
    }

    async fn forward_request(&self, request: Request, target_url: &str) -> anyhow::Result<Response> {
        let method = request.method().clone();
        let uri = request.uri().clone();
        let headers = request.headers().clone();
        let body = axum::body::to_bytes(request.into_body(), usize::MAX).await?;

        let full_url = format!("{}{}", target_url.trim_end_matches('/'), uri.path_and_query().map(|pq| pq.as_str()).unwrap_or(""));

        let mut req_builder = match method {
            Method::GET => self.client.get(&full_url),
            Method::POST => self.client.post(&full_url),
            Method::PUT => self.client.put(&full_url),
            Method::DELETE => self.client.delete(&full_url),
            Method::PATCH => self.client.patch(&full_url),
            Method::HEAD => self.client.head(&full_url),
            _ => return Err(anyhow::anyhow!("Unsupported HTTP method: {}", method)),
        };

        for (name, value) in headers.iter() {
            if let Ok(value_str) = value.to_str() {
                req_builder = req_builder.header(name.as_str(), value_str);
            }
        }

        if !body.is_empty() {
            req_builder = req_builder.body(body);
        }

        let response = req_builder.send().await?;
        
        let mut response_builder = Response::builder()
            .status(response.status().as_u16());

        for (name, value) in response.headers() {
            if let (Ok(name_str), Ok(value_str)) = (name.as_str().parse::<HeaderName>(), value.to_str()) {
                response_builder = response_builder.header(name_str, value_str);
            }
        }

        let body_bytes = response.bytes().await?;
        let final_response = response_builder.body(axum::body::Body::from(body_bytes))?;

        Ok(final_response)
    }

    pub async fn get_rules(&self) -> Vec<ForwardingRule> {
        let router = self.router.read().await;
        router.get_all_rules().into_iter().cloned().collect()
    }

    pub async fn clear_cache(&self) {
        self.content_manager.clear_cache().await;
    }

    pub async fn remove_content_from_cache(&self, source: &ContentSource) {
        self.content_manager.remove_from_cache(source).await;
    }
}

impl Default for ProxyEngine {
    fn default() -> Self {
        Self::new()
    }
}