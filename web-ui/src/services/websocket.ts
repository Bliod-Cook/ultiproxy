import { io, Socket } from 'socket.io-client';
import type { SystemMetrics } from './types';

const WS_URL = 'ws://localhost:8080/ws/events';

interface ServerToClientEvents {
  metrics_update: (data: SystemMetrics) => void;
  config_changed: () => void;
  rule_updated: () => void;
}

type ClientToServerEvents = Record<string, never>;

class WebSocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(WS_URL);

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe<T extends keyof ServerToClientEvents>(event: T, handler: ServerToClientEvents[T]) {
    if (this.socket) {
      // Using 'any' as a workaround for complex socket.io-client types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.socket.on(event, handler as any);
    }
  }

  unsubscribe<T extends keyof ServerToClientEvents>(event: T) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const webSocketService = new WebSocketService();