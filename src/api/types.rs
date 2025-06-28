use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::config::{Config, ForwardingRule};

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub request_count: u64,
    pub error_count: u64,
    pub avg_response_time: f64,
    pub cache_hit_ratio: f64,
    pub active_connections: u32,
    pub uptime_seconds: u64,
    pub rule_metrics: HashMap<String, RuleMetrics>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RuleMetrics {
    pub request_count: u64,
    pub error_count: u64,
    pub avg_response_time: f64,
    pub backend_health: HashMap<String, BackendHealth>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BackendHealth {
    pub is_healthy: bool,
    pub last_check: String,
    pub response_time: f64,
    pub error_count: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CacheStats {
    pub total_entries: usize,
    pub hit_count: u64,
    pub miss_count: u64,
    pub hit_ratio: f64,
    pub memory_usage_bytes: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ContentSourceInfo {
    pub source_type: String,
    pub identifier: String,
    pub last_updated: Option<String>,
    pub cache_ttl: u64,
    pub content_count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthStatus {
    pub status: String,
    pub uptime_seconds: u64,
    pub version: String,
    pub proxy_engine_status: String,
    pub config_file_status: String,
    pub cache_status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConfigValidationResult {
    pub is_valid: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RuleTestRequest {
    pub method: String,
    pub path: String,
    pub headers: HashMap<String, String>,
    pub body: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RuleTestResult {
    pub matched: bool,
    pub rule_name: Option<String>,
    pub target_url: Option<String>,
    pub applied_replacements: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum WebSocketEvent {
    MetricsUpdate { data: SystemMetrics },
    ConfigChanged { config: Config },
    RuleUpdated { rule: ForwardingRule },
    Error { message: String },
    CacheOperation { operation: String, source: String },
    BackendHealthChanged { backend: String, health: BackendHealth },
}