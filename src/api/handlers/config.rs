use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use crate::{AppState, config::Config};
use crate::api::types::{ApiResponse, ConfigValidationResult};

pub async fn get_config(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Config>>, StatusCode> {
    let config = state.config.read().await;
    Ok(Json(ApiResponse::success(config.clone())))
}

pub async fn update_config(
    State(state): State<AppState>,
    Json(new_config): Json<Config>,
) -> Result<Json<ApiResponse<String>>, StatusCode> {
    match new_config.validate() {
        Ok(_) => {
            if let Err(e) = state.proxy_engine.update_rules(new_config.forwarding_rules.clone()).await {
                return Ok(Json(ApiResponse::error(format!("Failed to update proxy rules: {}", e))));
            }
            
            let mut config = state.config.write().await;
            *config = new_config;
            
            Ok(Json(ApiResponse::success("Configuration updated successfully".to_string())))
        }
        Err(e) => {
            Ok(Json(ApiResponse::error(format!("Invalid configuration: {}", e))))
        }
    }
}

pub async fn reload_config(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<String>>, StatusCode> {
    let config_path = "config/ultiproxy.toml"; // TODO: Make this configurable
    
    match Config::from_file(config_path) {
        Ok(new_config) => {
            match new_config.validate() {
                Ok(_) => {
                    if let Err(e) = state.proxy_engine.update_rules(new_config.forwarding_rules.clone()).await {
                        return Ok(Json(ApiResponse::error(format!("Failed to update proxy rules: {}", e))));
                    }
                    
                    let mut config = state.config.write().await;
                    *config = new_config;
                    
                    Ok(Json(ApiResponse::success("Configuration reloaded successfully".to_string())))
                }
                Err(e) => {
                    Ok(Json(ApiResponse::error(format!("Invalid configuration: {}", e))))
                }
            }
        }
        Err(e) => {
            Ok(Json(ApiResponse::error(format!("Failed to load configuration: {}", e))))
        }
    }
}

pub async fn validate_config(
    Json(config): Json<Config>,
) -> Result<Json<ApiResponse<ConfigValidationResult>>, StatusCode> {
    let mut errors = Vec::new();
    let warnings = Vec::new();
    
    if let Err(e) = config.validate() {
        errors.push(e.to_string());
    }
    
    let result = ConfigValidationResult {
        is_valid: errors.is_empty(),
        errors,
        warnings,
    };
    
    Ok(Json(ApiResponse::success(result)))
}