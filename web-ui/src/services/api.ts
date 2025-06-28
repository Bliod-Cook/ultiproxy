import axios from 'axios';
import type {
  Config,
  ForwardingRule,
  ApiResponse,
  SystemMetrics,
  RuleTestRequest,
  RuleTestResult,
  ConfigValidationResult,
} from '../types/api';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

// Config
export const getConfig = (): Promise<ApiResponse<Config>> => apiClient.get('/config');
export const updateConfig = (config: Config): Promise<ApiResponse<Config>> => apiClient.put('/config', config);
export const reloadConfig = (): Promise<ApiResponse<null>> => apiClient.post('/config/reload');
export const validateConfig = (config: Config): Promise<ApiResponse<ConfigValidationResult>> => apiClient.post('/config/validate', config);

// Rules
export const listRules = (): Promise<ApiResponse<ForwardingRule[]>> => apiClient.get('/rules');
export const createRule = (rule: ForwardingRule): Promise<ApiResponse<ForwardingRule>> => apiClient.post('/rules', rule);
export const updateRule = (name: string, rule: ForwardingRule): Promise<ApiResponse<ForwardingRule>> => apiClient.put(`/rules/${name}`, rule);
export const deleteRule = (name: string): Promise<ApiResponse<null>> => apiClient.delete(`/rules/${name}`);
export const testRule = (name: string, data: RuleTestRequest): Promise<ApiResponse<RuleTestResult>> => apiClient.post(`/rules/${name}/test`, data);

// Content
export const listSources = (): Promise<ApiResponse<any>> => apiClient.get('/content/sources');
export const clearCache = (): Promise<ApiResponse<null>> => apiClient.post('/content/cache/clear');
export const cacheStats = (): Promise<ApiResponse<any>> => apiClient.get('/content/cache/stats');

// Metrics
export const getMetrics = (): Promise<ApiResponse<SystemMetrics>> => apiClient.get('/metrics');
export const healthCheck = (): Promise<ApiResponse<any>> => apiClient.get('/health');
export const getStatus = (): Promise<ApiResponse<any>> => apiClient.get('/status');

export default apiClient;