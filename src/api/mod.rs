pub mod handlers;
pub mod middleware;
pub mod types;
pub mod websocket;

use axum::{
    routing::{delete, get, post, put},
    Router,
};
use crate::AppState;

pub fn create_api_router() -> Router<AppState> {
    Router::new()
        .route("/api/config", get(handlers::config::get_config))
        .route("/api/config", put(handlers::config::update_config))
        .route("/api/config/reload", post(handlers::config::reload_config))
        .route("/api/config/validate", post(handlers::config::validate_config))
        .route("/api/rules", get(handlers::rules::list_rules))
        .route("/api/rules", post(handlers::rules::create_rule))
        .route("/api/rules/:name", put(handlers::rules::update_rule))
        .route("/api/rules/:name", delete(handlers::rules::delete_rule))
        .route("/api/rules/:name/test", post(handlers::rules::test_rule))
        .route("/api/content/sources", get(handlers::content::list_sources))
        .route("/api/content/cache/clear", post(handlers::content::clear_cache))
        .route("/api/content/cache/stats", get(handlers::content::cache_stats))
        .route("/api/metrics", get(handlers::metrics::get_metrics))
        .route("/api/health", get(handlers::metrics::health_check))
        .route("/api/status", get(handlers::metrics::get_status))
        .route("/ws/events", get(websocket::websocket_handler))
}