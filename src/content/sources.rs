use crate::config::{ContentSource, SourceType, SplitStrategy};
use anyhow::Result;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{error, warn};

#[derive(Debug, Clone)]
pub struct ContentManager {
    client: reqwest::Client,
    cache: Arc<RwLock<super::cache::ContentCache>>,
}

impl ContentManager {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
            cache: Arc::new(RwLock::new(super::cache::ContentCache::new())),
        }
    }

    pub async fn get_content(&self, source: &ContentSource) -> Result<Vec<String>> {
        let cache_key = self.generate_cache_key(source);
        
        {
            let cache = self.cache.read().await;
            if let Some(content) = cache.get(&cache_key) {
                return Ok(content.clone());
            }
        }

        let raw_content = match source.source {
            SourceType::File => self.read_file_content(source).await?,
            SourceType::Remote => self.fetch_remote_content(source).await?,
        };

        let split_content = self.split_content(&raw_content, &source.split_by);
        
        {
            let mut cache = self.cache.write().await;
            cache.insert(cache_key, split_content.clone(), source.cache_ttl);
        }

        Ok(split_content)
    }

    async fn read_file_content(&self, source: &ContentSource) -> Result<String> {
        let path = source.path.as_ref()
            .ok_or_else(|| anyhow::anyhow!("File path is required for file source"))?;
        
        match tokio::fs::read_to_string(path).await {
            Ok(content) => Ok(content),
            Err(e) => {
                error!("Failed to read file {}: {}", path, e);
                Err(anyhow::anyhow!("Failed to read file: {}", e))
            }
        }
    }

    async fn fetch_remote_content(&self, source: &ContentSource) -> Result<String> {
        let url = source.url.as_ref()
            .ok_or_else(|| anyhow::anyhow!("URL is required for remote source"))?;
        
        match self.client.get(url).send().await {
            Ok(response) => {
                if response.status().is_success() {
                    match response.text().await {
                        Ok(content) => Ok(content),
                        Err(e) => {
                            error!("Failed to read response body from {}: {}", url, e);
                            Err(anyhow::anyhow!("Failed to read response: {}", e))
                        }
                    }
                } else {
                    error!("HTTP error {} when fetching {}", response.status(), url);
                    Err(anyhow::anyhow!("HTTP error: {}", response.status()))
                }
            }
            Err(e) => {
                error!("Failed to fetch content from {}: {}", url, e);
                Err(anyhow::anyhow!("Request failed: {}", e))
            }
        }
    }

    fn split_content(&self, content: &str, strategy: &SplitStrategy) -> Vec<String> {
        let trimmed = content.trim();
        if trimmed.is_empty() {
            warn!("Content is empty after trimming");
            return vec![];
        }

        let parts: Vec<String> = match strategy {
            SplitStrategy::Line => {
                trimmed.lines()
                    .map(|s| s.trim().to_string())
                    .filter(|s| !s.is_empty())
                    .collect()
            }
            SplitStrategy::Comma => {
                trimmed.split(',')
                    .map(|s| s.trim().to_string())
                    .filter(|s| !s.is_empty())
                    .collect()
            }
            SplitStrategy::Space => {
                trimmed.split_whitespace()
                    .map(|s| s.to_string())
                    .collect()
            }
        };

        if parts.is_empty() {
            warn!("No valid content found after splitting");
        }

        parts
    }

    fn generate_cache_key(&self, source: &ContentSource) -> String {
        match source.source {
            SourceType::File => {
                format!("file:{}", source.path.as_ref().unwrap_or(&"unknown".to_string()))
            }
            SourceType::Remote => {
                format!("remote:{}", source.url.as_ref().unwrap_or(&"unknown".to_string()))
            }
        }
    }

    pub async fn clear_cache(&self) {
        let mut cache = self.cache.write().await;
        cache.clear();
    }

    pub async fn remove_from_cache(&self, source: &ContentSource) {
        let cache_key = self.generate_cache_key(source);
        let mut cache = self.cache.write().await;
        cache.remove(&cache_key);
    }
}