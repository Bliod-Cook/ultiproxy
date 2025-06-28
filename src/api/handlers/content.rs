use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use crate::AppState;
use crate::api::types::{ApiResponse, ContentSourceInfo, CacheStats};

pub async fn list_sources(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<ContentSourceInfo>>>, StatusCode> {
    let config = state.config.read().await;
    let mut sources = Vec::new();
    
    for rule in &config.forwarding_rules {
        for (key, source) in &rule.header_replacements {
            sources.push(ContentSourceInfo {
                source_type: format!("{:?}", source.source),
                identifier: format!("{}:header:{}", rule.name, key),
                last_updated: None,
                cache_ttl: source.cache_ttl,
                content_count: 0, // TODO: Get actual count from content manager
            });
        }
        
        for (key, source) in &rule.body_replacements {
            sources.push(ContentSourceInfo {
                source_type: format!("{:?}", source.source),
                identifier: format!("{}:body:{}", rule.name, key),
                last_updated: None,
                cache_ttl: source.cache_ttl,
                content_count: 0, // TODO: Get actual count from content manager
            });
        }
    }
    
    Ok(Json(ApiResponse::success(sources)))
}

pub async fn clear_cache(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<String>>, StatusCode> {
    state.proxy_engine.clear_cache().await;
    Ok(Json(ApiResponse::success("Cache cleared successfully".to_string())))
}

pub async fn cache_stats(
    State(_state): State<AppState>,
) -> Result<Json<ApiResponse<CacheStats>>, StatusCode> {
    // TODO: Implement actual cache statistics
    let stats = CacheStats {
        total_entries: 0,
        hit_count: 0,
        miss_count: 0,
        hit_ratio: 0.0,
        memory_usage_bytes: 0,
    };
    
    Ok(Json(ApiResponse::success(stats)))
}