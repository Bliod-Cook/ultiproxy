export interface ServerConfig {
  host: string;
  port: number;
  web_ui_port: number;
}

export interface LoggingConfig {
  level: string;
  file?: string;
}

export interface ContentSource {
  source: 'file' | 'remote';
  path?: string;
  url?: string;
  split_by: 'line' | 'comma' | 'space';
  cache_ttl?: number;
}

export interface Replacement {
  [key: string]: ContentSource;
}

export interface ForwardingRule {
  name: string;
  path: string;
  target_urls: string[];
  load_balancing: 'round_robin';
  header_replacements?: Replacement;
  body_replacements?: Replacement;
}

export interface Config {
  server: ServerConfig;
  logging: LoggingConfig;
  forwarding_rules: ForwardingRule[];
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
  status: 'up' | 'down';
  response_time: number;
}

export interface ProxyStatus {
  status: string;
  uptime: string;
  total_requests: number;
  total_errors: number;
}

export interface HealthStatus {
  status: 'ok' | 'degraded';
  details: Record<string, 'ok' | 'error'>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  entries: number;
}