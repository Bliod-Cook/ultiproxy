import type {
  Config,
  ForwardingRule,
  SystemMetrics,
  ProxyStatus,
  HealthStatus,
  CacheStats,
} from './types';

const API_BASE_URL = 'http://localhost:8080/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result: ApiResponse<T> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }

  return result.data;
}

export const api = {
  getConfig: () => request<Config>('/config'),
  updateConfig: (config: Config) => request<void>('/config', {
    method: 'PUT',
    body: JSON.stringify(config),
  }),
  reloadConfig: () => request<void>('/config/reload', { method: 'POST' }),
  validateConfig: (config: Config) => request<void>('/config/validate', {
    method: 'POST',
    body: JSON.stringify(config),
  }),

  getRules: () => request<ForwardingRule[]>('/rules'),
  createRule: (rule: ForwardingRule) => request<void>('/rules', {
    method: 'POST',
    body: JSON.stringify(rule),
  }),
  updateRule: (name: string, rule: ForwardingRule) => request<void>(`/rules/${name}`, {
    method: 'PUT',
    body: JSON.stringify(rule),
  }),
  deleteRule: (name: string) => request<void>(`/rules/${name}`, { method: 'DELETE' }),

  getMetrics: () => request<SystemMetrics>('/metrics'),
  getStatus: () => request<ProxyStatus>('/status'),
  getHealth: () => request<HealthStatus>('/health'),

  clearCache: () => request<void>('/content/cache/clear', { method: 'POST' }),
  getCacheStats: () => request<CacheStats>('/content/cache/stats'),
};