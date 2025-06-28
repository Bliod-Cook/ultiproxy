use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::Response,
};
use futures::{sink::SinkExt, stream::StreamExt};
use tokio::time::{interval, Duration};
use tracing::{error, info};
use crate::AppState;
use crate::api::types::WebSocketEvent;

pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> Response {
    ws.on_upgrade(|socket| websocket_connection(socket, state))
}

async fn websocket_connection(socket: WebSocket, _state: AppState) {
    let (mut sender, mut receiver) = socket.split();
    
    info!("WebSocket connection established");
    
    let mut interval = interval(Duration::from_secs(5));
    
    loop {
        tokio::select! {
            msg = receiver.next() => {
                match msg {
                    Some(Ok(Message::Text(text))) => {
                        info!("Received WebSocket message: {}", text);
                        // Handle incoming messages if needed
                    }
                    Some(Ok(Message::Close(_))) => {
                        info!("WebSocket connection closed by client");
                        break;
                    }
                    Some(Err(e)) => {
                        error!("WebSocket error: {}", e);
                        break;
                    }
                    None => break,
                    _ => {}
                }
            }
            _ = interval.tick() => {
                // Send periodic metrics updates
                let event = WebSocketEvent::MetricsUpdate {
                    data: crate::api::types::SystemMetrics {
                        request_count: 0,
                        error_count: 0,
                        avg_response_time: 0.0,
                        cache_hit_ratio: 0.0,
                        active_connections: 0,
                        uptime_seconds: 0,
                        rule_metrics: std::collections::HashMap::new(),
                    }
                };
                
                if let Ok(json) = serde_json::to_string(&event) {
                    if sender.send(Message::Text(json)).await.is_err() {
                        error!("Failed to send WebSocket message");
                        break;
                    }
                }
            }
        }
    }
    
    info!("WebSocket connection closed");
}