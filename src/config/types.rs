use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub server: ServerConfig,
    pub logging: LoggingConfig,
    pub forwarding_rules: Vec<ForwardingRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub web_ui_port: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    pub level: String,
    pub file: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForwardingRule {
    pub name: String,
    pub path: String,
    pub target_urls: Vec<String>,
    pub load_balancing: LoadBalancingStrategy,
    #[serde(default)]
    pub header_replacements: HashMap<String, ContentSource>,
    #[serde(default)]
    pub body_replacements: HashMap<String, ContentSource>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LoadBalancingStrategy {
    RoundRobin,
    Random,
    WeightedRoundRobin,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContentSource {
    pub source: SourceType,
    pub path: Option<String>,
    pub url: Option<String>,
    pub split_by: SplitStrategy,
    #[serde(default = "default_cache_ttl")]
    pub cache_ttl: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SourceType {
    File,
    Remote,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SplitStrategy {
    Line,
    Comma,
    Space,
}

fn default_cache_ttl() -> u64 {
    300 // 5 minutes
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            host: "0.0.0.0".to_string(),
            port: 8080,
            web_ui_port: 3000,
        }
    }
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self {
            level: "info".to_string(),
            file: None,
        }
    }
}

impl Default for LoadBalancingStrategy {
    fn default() -> Self {
        Self::RoundRobin
    }
}

impl Config {
    pub fn from_file(path: &str) -> anyhow::Result<Self> {
        let content = std::fs::read_to_string(path)?;
        let config: Config = toml::from_str(&content)?;
        Ok(config)
    }

    pub fn validate(&self) -> anyhow::Result<()> {
        if self.forwarding_rules.is_empty() {
            return Err(anyhow::anyhow!("At least one forwarding rule is required"));
        }

        for rule in &self.forwarding_rules {
            if rule.target_urls.is_empty() {
                return Err(anyhow::anyhow!("Rule '{}' must have at least one target URL", rule.name));
            }

            for (key, source) in &rule.header_replacements {
                source.validate(&format!("header replacement '{}'", key))?;
            }

            for (key, source) in &rule.body_replacements {
                source.validate(&format!("body replacement '{}'", key))?;
            }
        }

        Ok(())
    }
}

impl ContentSource {
    fn validate(&self, context: &str) -> anyhow::Result<()> {
        match self.source {
            SourceType::File => {
                if self.path.is_none() {
                    return Err(anyhow::anyhow!("{}: file source requires 'path' field", context));
                }
            }
            SourceType::Remote => {
                if self.url.is_none() {
                    return Err(anyhow::anyhow!("{}: remote source requires 'url' field", context));
                }
            }
        }
        Ok(())
    }
}