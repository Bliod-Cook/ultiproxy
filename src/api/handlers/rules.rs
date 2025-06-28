use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use crate::{AppState, config::ForwardingRule};
use crate::api::types::{ApiResponse, RuleTestRequest, RuleTestResult};

pub async fn list_rules(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<ForwardingRule>>>, StatusCode> {
    let rules = state.proxy_engine.get_rules().await;
    Ok(Json(ApiResponse::success(rules)))
}

pub async fn create_rule(
    State(state): State<AppState>,
    Json(rule): Json<ForwardingRule>,
) -> Result<Json<ApiResponse<String>>, StatusCode> {
    let mut config = state.config.write().await;
    
    if config.forwarding_rules.iter().any(|r| r.name == rule.name) {
        return Ok(Json(ApiResponse::error(format!("Rule '{}' already exists", rule.name))));
    }
    
    config.forwarding_rules.push(rule.clone());
    
    if let Err(e) = state.proxy_engine.update_rules(config.forwarding_rules.clone()).await {
        config.forwarding_rules.pop();
        return Ok(Json(ApiResponse::error(format!("Failed to update proxy rules: {}", e))));
    }
    
    Ok(Json(ApiResponse::success(format!("Rule '{}' created successfully", rule.name))))
}

pub async fn update_rule(
    State(state): State<AppState>,
    Path(name): Path<String>,
    Json(updated_rule): Json<ForwardingRule>,
) -> Result<Json<ApiResponse<String>>, StatusCode> {
    let mut config = state.config.write().await;
    
    if let Some(rule) = config.forwarding_rules.iter_mut().find(|r| r.name == name) {
        let old_rule = rule.clone();
        *rule = updated_rule;
        
        let rules_clone = config.forwarding_rules.clone();
        drop(config);
        
        if let Err(e) = state.proxy_engine.update_rules(rules_clone).await {
            let mut config = state.config.write().await;
            if let Some(rule) = config.forwarding_rules.iter_mut().find(|r| r.name == name) {
                *rule = old_rule;
            }
            return Ok(Json(ApiResponse::error(format!("Failed to update proxy rules: {}", e))));
        }
        
        Ok(Json(ApiResponse::success(format!("Rule '{}' updated successfully", name))))
    } else {
        Ok(Json(ApiResponse::error(format!("Rule '{}' not found", name))))
    }
}

pub async fn delete_rule(
    State(state): State<AppState>,
    Path(name): Path<String>,
) -> Result<Json<ApiResponse<String>>, StatusCode> {
    let mut config = state.config.write().await;
    
    if let Some(pos) = config.forwarding_rules.iter().position(|r| r.name == name) {
        let removed_rule = config.forwarding_rules.remove(pos);
        
        if let Err(e) = state.proxy_engine.update_rules(config.forwarding_rules.clone()).await {
            config.forwarding_rules.insert(pos, removed_rule);
            return Ok(Json(ApiResponse::error(format!("Failed to update proxy rules: {}", e))));
        }
        
        Ok(Json(ApiResponse::success(format!("Rule '{}' deleted successfully", name))))
    } else {
        Ok(Json(ApiResponse::error(format!("Rule '{}' not found", name))))
    }
}

pub async fn test_rule(
    State(state): State<AppState>,
    Path(name): Path<String>,
    Json(test_request): Json<RuleTestRequest>,
) -> Result<Json<ApiResponse<RuleTestResult>>, StatusCode> {
    let config = state.config.read().await;
    
    if let Some(rule) = config.forwarding_rules.iter().find(|r| r.name == name) {
        // Simple path matching test
        let path_regex = rule.path.replace("*", "[^/]*").replace("**", ".*");
        let regex = regex::Regex::new(&format!("^{}$", path_regex)).unwrap_or_else(|_| {
            regex::Regex::new("^$").unwrap()
        });
        
        let matched = regex.is_match(&test_request.path);
        
        let result = RuleTestResult {
            matched,
            rule_name: if matched { Some(rule.name.clone()) } else { None },
            target_url: if matched && !rule.target_urls.is_empty() { 
                Some(rule.target_urls[0].clone()) 
            } else { 
                None 
            },
            applied_replacements: std::collections::HashMap::new(), // TODO: Implement replacement simulation
        };
        
        Ok(Json(ApiResponse::success(result)))
    } else {
        Ok(Json(ApiResponse::error(format!("Rule '{}' not found", name))))
    }
}