use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::Path;
use std::sync::mpsc;
use std::time::Duration;
use tokio::sync::broadcast;
use tracing::{error, info};

pub struct ConfigWatcher {
    _watcher: RecommendedWatcher,
    pub receiver: broadcast::Receiver<()>,
}

impl ConfigWatcher {
    pub fn new(config_path: &str) -> anyhow::Result<(Self, broadcast::Sender<()>)> {
        let (tx, rx) = broadcast::channel(16);
        let (file_tx, file_rx) = mpsc::channel();
        
        let tx_clone = tx.clone();
        let config_path = config_path.to_string();
        
        let mut watcher = RecommendedWatcher::new(
            move |res: Result<Event, notify::Error>| {
                match res {
                    Ok(event) => {
                        if let Err(e) = file_tx.send(event) {
                            error!("Failed to send file event: {}", e);
                        }
                    }
                    Err(e) => error!("File watch error: {}", e),
                }
            },
            Config::default().with_poll_interval(Duration::from_secs(1)),
        )?;

        watcher.watch(Path::new(&config_path), RecursiveMode::NonRecursive)?;

        tokio::spawn(async move {
            while let Ok(event) = file_rx.recv() {
                if event.kind.is_modify() {
                    info!("Configuration file changed, reloading...");
                    if let Err(e) = tx_clone.send(()) {
                        error!("Failed to broadcast config change: {}", e);
                    }
                }
            }
        });

        Ok((
            Self {
                _watcher: watcher,
                receiver: rx,
            },
            tx,
        ))
    }
}