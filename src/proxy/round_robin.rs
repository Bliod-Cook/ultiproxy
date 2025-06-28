use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

#[derive(Debug)]
pub struct RoundRobinSelector {
    counter: AtomicUsize,
}

impl RoundRobinSelector {
    pub fn new() -> Self {
        Self {
            counter: AtomicUsize::new(0),
        }
    }

    pub fn select<'a, T>(&self, items: &'a [T]) -> Option<&'a T> {
        if items.is_empty() {
            return None;
        }

        let index = self.counter.fetch_add(1, Ordering::Relaxed) % items.len();
        items.get(index)
    }

    pub fn select_owned<T: Clone>(&self, items: &[T]) -> Option<T> {
        self.select(items).cloned()
    }

    pub fn reset(&self) {
        self.counter.store(0, Ordering::Relaxed);
    }
}

impl Default for RoundRobinSelector {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone)]
pub struct RoundRobinManager {
    url_selector: Arc<RoundRobinSelector>,
    content_selectors: Arc<dashmap::DashMap<String, RoundRobinSelector>>,
}

impl RoundRobinManager {
    pub fn new() -> Self {
        Self {
            url_selector: Arc::new(RoundRobinSelector::new()),
            content_selectors: Arc::new(dashmap::DashMap::new()),
        }
    }

    pub fn select_target_url(&self, urls: &[String]) -> Option<String> {
        self.url_selector.select_owned(urls)
    }

    pub fn select_replacement_content(&self, key: &str, content: &[String]) -> Option<String> {
        if content.is_empty() {
            return None;
        }

        let selector = self.content_selectors
            .entry(key.to_string())
            .or_insert_with(RoundRobinSelector::new);
        
        selector.select_owned(content)
    }

    pub fn reset_url_selector(&self) {
        self.url_selector.reset();
    }

    pub fn reset_content_selector(&self, key: &str) {
        if let Some(selector) = self.content_selectors.get(key) {
            selector.reset();
        }
    }

    pub fn clear_content_selectors(&self) {
        self.content_selectors.clear();
    }
}

impl Default for RoundRobinManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_round_robin_selector() {
        let selector = RoundRobinSelector::new();
        let items = vec!["a", "b", "c"];

        assert_eq!(selector.select(&items), Some(&"a"));
        assert_eq!(selector.select(&items), Some(&"b"));
        assert_eq!(selector.select(&items), Some(&"c"));
        assert_eq!(selector.select(&items), Some(&"a"));
    }

    #[test]
    fn test_empty_items() {
        let selector = RoundRobinSelector::new();
        let items: Vec<&str> = vec![];
        assert_eq!(selector.select(&items), None);
    }

    #[test]
    fn test_round_robin_manager() {
        let manager = RoundRobinManager::new();
        let urls = vec!["url1".to_string(), "url2".to_string()];
        
        assert_eq!(manager.select_target_url(&urls), Some("url1".to_string()));
        assert_eq!(manager.select_target_url(&urls), Some("url2".to_string()));
        assert_eq!(manager.select_target_url(&urls), Some("url1".to_string()));
    }
}