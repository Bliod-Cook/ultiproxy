use crate::config::ForwardingRule;
use regex::Regex;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct RoutePattern {
    pub pattern: String,
    pub regex: Regex,
    pub rule: ForwardingRule,
}

#[derive(Debug)]
pub struct ProxyRouter {
    routes: Vec<RoutePattern>,
}

impl ProxyRouter {
    pub fn new() -> Self {
        Self {
            routes: Vec::new(),
        }
    }

    pub fn add_rule(&mut self, rule: ForwardingRule) -> anyhow::Result<()> {
        let pattern = self.path_to_regex(&rule.path)?;
        let regex = Regex::new(&pattern)?;
        
        self.routes.push(RoutePattern {
            pattern,
            regex,
            rule,
        });

        Ok(())
    }

    pub fn find_matching_rule(&self, path: &str) -> Option<&ForwardingRule> {
        for route in &self.routes {
            if route.regex.is_match(path) {
                return Some(&route.rule);
            }
        }
        None
    }

    pub fn update_rules(&mut self, rules: Vec<ForwardingRule>) -> anyhow::Result<()> {
        self.routes.clear();
        for rule in rules {
            self.add_rule(rule)?;
        }
        Ok(())
    }

    pub fn get_all_rules(&self) -> Vec<&ForwardingRule> {
        self.routes.iter().map(|r| &r.rule).collect()
    }

    fn path_to_regex(&self, path: &str) -> anyhow::Result<String> {
        let mut regex_pattern = String::new();
        regex_pattern.push('^');

        let mut chars = path.chars().peekable();
        while let Some(ch) = chars.next() {
            match ch {
                '*' => {
                    if chars.peek() == Some(&'*') {
                        chars.next();
                        regex_pattern.push_str(".*");
                    } else {
                        regex_pattern.push_str("[^/]*");
                    }
                }
                '?' => regex_pattern.push('.'),
                '.' | '+' | '^' | '$' | '(' | ')' | '[' | ']' | '{' | '}' | '|' | '\\' => {
                    regex_pattern.push('\\');
                    regex_pattern.push(ch);
                }
                _ => regex_pattern.push(ch),
            }
        }

        regex_pattern.push('$');
        Ok(regex_pattern)
    }
}

impl Default for ProxyRouter {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone)]
pub struct RouteMatch {
    pub rule: ForwardingRule,
    pub captures: HashMap<String, String>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::LoadBalancingStrategy;

    fn create_test_rule(name: &str, path: &str) -> ForwardingRule {
        ForwardingRule {
            name: name.to_string(),
            path: path.to_string(),
            target_urls: vec!["http://example.com".to_string()],
            load_balancing: LoadBalancingStrategy::RoundRobin,
            header_replacements: HashMap::new(),
            body_replacements: HashMap::new(),
        }
    }

    #[test]
    fn test_exact_path_matching() {
        let mut router = ProxyRouter::new();
        let rule = create_test_rule("test", "/api/users");
        router.add_rule(rule).unwrap();

        assert!(router.find_matching_rule("/api/users").is_some());
        assert!(router.find_matching_rule("/api/user").is_none());
        assert!(router.find_matching_rule("/api/users/123").is_none());
    }

    #[test]
    fn test_wildcard_matching() {
        let mut router = ProxyRouter::new();
        let rule = create_test_rule("test", "/api/*");
        router.add_rule(rule).unwrap();

        assert!(router.find_matching_rule("/api/users").is_some());
        assert!(router.find_matching_rule("/api/posts").is_some());
        assert!(router.find_matching_rule("/api/").is_some());
        assert!(router.find_matching_rule("/api/users/123").is_none());
    }

    #[test]
    fn test_double_wildcard_matching() {
        let mut router = ProxyRouter::new();
        let rule = create_test_rule("test", "/api/**");
        router.add_rule(rule).unwrap();

        assert!(router.find_matching_rule("/api/users").is_some());
        assert!(router.find_matching_rule("/api/users/123").is_some());
        assert!(router.find_matching_rule("/api/users/123/posts").is_some());
        assert!(router.find_matching_rule("/api/").is_some());
        assert!(router.find_matching_rule("/other").is_none());
    }

    #[test]
    fn test_path_to_regex() {
        let router = ProxyRouter::new();
        
        assert_eq!(router.path_to_regex("/api/users").unwrap(), "^/api/users$");
        assert_eq!(router.path_to_regex("/api/*").unwrap(), "^/api/[^/]*$");
        assert_eq!(router.path_to_regex("/api/**").unwrap(), "^/api/.*$");
        assert_eq!(router.path_to_regex("/api/user?").unwrap(), "^/api/user.$");
    }
}