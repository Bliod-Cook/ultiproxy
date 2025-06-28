mod config;
mod content;
mod proxy;

use axum::{
    extract::Request,
    http::StatusCode,
    response::Response,
    routing::{any, get},
    Router,
};
use clap::Parser;
use config::{Config, ConfigWatcher};
use proxy::ProxyEngine;
use std::sync::Arc;
use tokio::signal;
use tower::ServiceBuilder;
use tower_http::{
    cors::CorsLayer,
    trace::TraceLayer,
};
use tracing::info;

#[derive(Parser, Debug)]
#[command(name = "ultiproxy")]
#[command(about = "A configurable HTTP proxy with content replacement")]
struct Args {
    #[arg(short, long, default_value = "config/ultiproxy.toml")]
    config: String,
}

#[derive(Clone)]
struct AppState {
    proxy_engine: Arc<ProxyEngine>,
    config: Arc<tokio::sync::RwLock<Config>>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let args = Args::parse();
    
    let config = Config::from_file(&args.config)?;
    config.validate()?;
    
    info!("Starting UltiProxy server...");
    info!("Configuration loaded from: {}", args.config);

    let proxy_engine = Arc::new(ProxyEngine::new());
    proxy_engine.update_rules(config.forwarding_rules.clone()).await?;

    let state = AppState {
        proxy_engine: proxy_engine.clone(),
        config: Arc::new(tokio::sync::RwLock::new(config.clone())),
    };

    let (_watcher, _config_tx) = ConfigWatcher::new(&args.config)?;
    
    let app = Router::new()
        .route("/health", get(health_check))
        .fallback(any(proxy_handler))
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(CorsLayer::permissive())
        )
        .with_state(state);

    let listener = tokio::net::TcpListener::bind(format!("{}:{}",
        config.server.host,
        config.server.port
    )).await?;

    info!("Server listening on {}:{}", config.server.host, config.server.port);

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn proxy_handler(
    axum::extract::State(state): axum::extract::State<AppState>,
    request: Request,
) -> Result<Response, StatusCode> {
    state.proxy_engine.handle_request(request).await
}

async fn health_check() -> &'static str {
    "OK"
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    info!("Shutdown signal received, starting graceful shutdown");
}
