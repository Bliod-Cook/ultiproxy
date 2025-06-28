import { useMetricsStore } from '../stores/metricsStore';
import { useConfigStore } from '../stores/configStore';
import { useRulesStore } from '../stores/rulesStore';
import { useUiStore } from '../stores/uiStore';
import type { WebSocketEvent } from '../types/api';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 1000;

  connect(): void {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const url = `${proto}//${host}:8080/ws/events`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.ws?.close();
    };
  }

  private handleMessage(event: WebSocketEvent): void {
    switch (event.type) {
      case 'MetricsUpdate':
        useMetricsStore.getState().setMetrics(event.data);
        break;
      case 'ConfigChanged':
        useConfigStore.getState().fetchConfig();
        useUiStore.getState().setNotification({ message: 'Configuration was changed externally', type: 'info' });
        break;
      case 'RuleUpdated':
        useRulesStore.getState().fetchRules();
        useUiStore.getState().setNotification({ message: `Rule ${event.data.name} was updated`, type: 'info' });
        break;
      case 'Error':
        useUiStore.getState().setNotification({ message: `Backend error: ${event.data.message}`, type: 'error' });
        break;
      // Add other cases as needed
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`WebSocket reconnect attempt ${this.reconnectAttempts}`);
        this.connect();
      }, this.reconnectInterval * Math.pow(2, this.reconnectAttempts));
    } else {
      console.error('WebSocket max reconnect attempts reached');
    }
  }

  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts; // prevent reconnecting
    this.ws?.close();
  }
}

export const webSocketService = new WebSocketService();