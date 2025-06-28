use dashmap::DashMap;
use std::time::{Duration, Instant};

#[derive(Debug, Clone)]
struct CacheEntry {
    content: Vec<String>,
    expires_at: Instant,
}

#[derive(Debug)]
pub struct ContentCache {
    entries: DashMap<String, CacheEntry>,
}

impl ContentCache {
    pub fn new() -> Self {
        Self {
            entries: DashMap::new(),
        }
    }

    pub fn insert(&mut self, key: String, content: Vec<String>, ttl_seconds: u64) {
        let expires_at = Instant::now() + Duration::from_secs(ttl_seconds);
        let entry = CacheEntry {
            content,
            expires_at,
        };
        self.entries.insert(key, entry);
    }

    pub fn get(&self, key: &str) -> Option<Vec<String>> {
        if let Some(entry) = self.entries.get(key) {
            if Instant::now() < entry.expires_at {
                return Some(entry.content.clone());
            } else {
                drop(entry);
                self.entries.remove(key);
            }
        }
        None
    }

    pub fn remove(&mut self, key: &str) {
        self.entries.remove(key);
    }

    pub fn clear(&mut self) {
        self.entries.clear();
    }

    pub fn cleanup_expired(&mut self) {
        let now = Instant::now();
        self.entries.retain(|_, entry| now < entry.expires_at);
    }

    pub fn size(&self) -> usize {
        self.entries.len()
    }
}

impl Default for ContentCache {
    fn default() -> Self {
        Self::new()
    }
}