import type { SystemMetrics } from './types';
import { config } from '../config/env';

const WS_URL = config.wsBaseUrl;

interface WebSocketEvent {
  type: 'metrics_update' | 'config_changed' | 'rule_updated';
  data?: SystemMetrics;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private eventHandlers: Map<string, ((data: unknown) => void)[]> = new Map();
  private reconnectInterval: number | null = null;

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketEvent = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.scheduleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  disconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  subscribe(event: string, handler: (data: unknown) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  unsubscribe(event: string) {
    this.eventHandlers.delete(event);
  }

  private handleMessage(message: WebSocketEvent) {
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message.data));
    }
  }

  private scheduleReconnect() {
    if (!this.reconnectInterval) {
      this.reconnectInterval = window.setInterval(() => {
        console.log('Attempting to reconnect WebSocket...');
        this.connect();
      }, 5000);
    }
  }
}

export const webSocketService = new WebSocketService();