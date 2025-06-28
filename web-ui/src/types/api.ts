export interface ForwardingRule {
  name: string;
  path: string;
  target_urls: string[];
  load_balancing: 'round_robin' | 'random' | 'weighted_round_robin';
  header_replacements: Record<string, ContentSource>;
  body_replacements: Record<string, ContentSource>;
}

export interface ContentSource {
  source: 'file' | 'remote';
  path?: string;
  url?: string;
  split_by: 'line' | 'comma' | 'space';
  cache_ttl: number;
}

export interface SystemMetrics {
  request_count: number;
  error_count: number;
  avg_response_time: number;
  cache_hit_ratio: number;
  active_connections: number;
  uptime_seconds: number;
  rule_metrics: Record<string, RuleMetrics>;
}

export interface RuleMetrics {
  request_count: number;
  error_count: number;
  avg_response_time: number;
  backend_health: Record<string, BackendHealth>;
}

export interface BackendHealth {
  is_healthy: boolean;
  last_check: string;
  response_time: number;
  error_count: number;
}

export interface WebSocketEvent {
  type: 'MetricsUpdate' | 'ConfigChanged' | 'RuleUpdated' | 'Error' | 'CacheOperation' | 'BackendHealthChanged';
  data: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Config {
  server: ServerConfig;
  logging: LoggingConfig;
  forwarding_rules: ForwardingRule[];
}

export interface ServerConfig {
  host: string;
  port: number;
  web_ui_port: number;
}

export interface LoggingConfig {
  level: string;
  file?: string;
}

export interface RuleTestRequest {
    method: string;
    path: string;
    headers: Record<string, string>;
    body?: string;
}

export interface RuleTestResult {
    matched: boolean;
    rule_name?: string;
    target_url?: string;
    applied_replacements: Record<string, string>;
}

export interface ConfigValidationResult {
    is_valid: boolean;
    errors: string[];
    warnings: string[];
}