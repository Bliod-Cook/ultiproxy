const getBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  if (import.meta.env.DEV) {
    return '';
  }
  
  return window.location.origin;
};

const getWsUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const url = new URL(baseUrl);
    return `${wsProtocol}://${url.host}`;
  }
  
  if (import.meta.env.DEV) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${wsProtocol}://${window.location.host}`;
  }
  
  const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${wsProtocol}://${window.location.host}`;
};

export const config = {
  apiBaseUrl: `${getBaseUrl()}/api`,
  wsBaseUrl: `${getWsUrl()}/ws/events`,
};