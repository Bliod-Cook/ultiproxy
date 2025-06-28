# UltiProxy - HTTP Forwarding Service

A sophisticated HTTP proxy service built in Rust that supports configurable forwarding rules, dynamic content replacement, and round-robin load balancing.

## Features

✅ **Implemented (Phase 1 - Core Proxy Engine)**
- ✅ HTTP request routing based on path patterns
- ✅ Round-robin load balancing between multiple target URLs
- ✅ TOML configuration file support
- ✅ File-based content replacement sources
- ✅ Header and body content replacement
- ✅ Health check endpoint
- ✅ Structured logging with tracing
- ✅ Graceful shutdown handling

✅ **Phase 2 Completed**
- REST API endpoints for configuration management
- Real-time WebSocket support for events
- Enhanced health check and metrics endpoints
- Rules management API (CRUD operations)
- Content source management API

🚧 **In Progress**
- Configuration hot-reload integration (file watcher ready)
- Metrics collection system (basic structure implemented)
- WebUI development (next phase)

📋 **Planned (Future Phases)**
- React-based WebUI for management
- Real-time monitoring dashboard
- API endpoints for configuration management
- WebSocket for real-time updates
- Enhanced security features
- Docker containerization

## Quick Start

### 1. Build the Project

```bash
cargo build --release
```

### 2. Configure the Proxy

Edit `config/ultiproxy.toml`:

```toml
[server]
host = "0.0.0.0"
port = 8080
web_ui_port = 3000

[logging]
level = "info"

[[forwarding_rules]]
name = "api_proxy"
path = "/api/*"
target_urls = ["http://httpbin.org", "http://jsonplaceholder.typicode.com"]
load_balancing = "round_robin"

[forwarding_rules.header_replacements]
"X-Custom-Header" = { source = "file", path = "./examples/headers.txt", split_by = "line", cache_ttl = 300 }

[forwarding_rules.body_replacements]
"{{API_KEY}}" = { source = "file", path = "./examples/api_keys.txt", split_by = "line", cache_ttl = 600 }
```

### 3. Run the Proxy

```bash
# Windows PowerShell
$env:RUST_LOG="debug"; ./target/release/ultiproxy.exe

# Linux/macOS
RUST_LOG=debug ./target/release/ultiproxy
```

### 4. Test the Proxy

```bash
# Health check
curl http://localhost:8080/health

# Test round-robin load balancing
curl http://localhost:8080/api/anything
curl http://localhost:8080/api/anything  # Will go to different backend

# Test with custom headers
curl -H "X-Custom-Header: test" http://localhost:8080/api/anything
```

## API Endpoints

UltiProxy now includes a comprehensive REST API for runtime management:

### Configuration Management
```bash
# Get current configuration
curl http://localhost:8080/api/config

# Update configuration (requires JSON body)
curl -X PUT http://localhost:8080/api/config \
  -H "Content-Type: application/json" \
  -d @new-config.json

# Reload configuration from file
curl -X POST http://localhost:8080/api/config/reload

# Validate configuration without applying
curl -X POST http://localhost:8080/api/config/validate \
  -H "Content-Type: application/json" \
  -d @config-to-validate.json
```

### Rules Management
```bash
# List all forwarding rules
curl http://localhost:8080/api/rules

# Create new rule
curl -X POST http://localhost:8080/api/rules \
  -H "Content-Type: application/json" \
  -d '{"name":"new_rule","path":"/new/*","target_urls":["http://example.com"],"load_balancing":"round_robin"}'

# Update existing rule
curl -X PUT http://localhost:8080/api/rules/rule_name \
  -H "Content-Type: application/json" \
  -d @updated-rule.json

# Delete rule
curl -X DELETE http://localhost:8080/api/rules/rule_name

# Test rule against sample request
curl -X POST http://localhost:8080/api/rules/api_proxy/test \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","path":"/api/users","headers":{}}'
```

### Monitoring & Metrics
```bash
# Get system metrics
curl http://localhost:8080/api/metrics

# Enhanced health check
curl http://localhost:8080/api/health

# Get proxy status
curl http://localhost:8080/api/status
```

### Content Management
```bash
# List content sources
curl http://localhost:8080/api/content/sources

# Clear all cache
curl -X POST http://localhost:8080/api/content/cache/clear

# Get cache statistics
curl http://localhost:8080/api/content/cache/stats
```

### WebSocket Events
Connect to `ws://localhost:8080/ws/events` for real-time updates including:
- Metrics updates (every 5 seconds)
- Configuration changes
- Rule updates
- Error events
- Cache operations

## Configuration

### Forwarding Rules

Each forwarding rule supports:

- **Path patterns**: Use `*` for single-level wildcards, `**` for multi-level
- **Multiple target URLs**: Automatically load-balanced using round-robin
- **Header replacements**: Replace header values with content from files/URLs
- **Body replacements**: Replace patterns in request body with dynamic content

### Content Sources

Content for replacements can come from:

- **Local files**: `source = "file"`, `path = "./path/to/file.txt"`
- **Remote URLs**: `source = "remote"`, `url = "https://api.example.com/tokens"`

Content splitting options:
- `split_by = "line"` - Split by newlines
- `split_by = "comma"` - Split by commas  
- `split_by = "space"` - Split by whitespace

### Load Balancing

Currently supports:
- `round_robin` - Cycle through targets in order

## Architecture

The proxy consists of several key components:

- **Router**: Matches incoming requests to forwarding rules using regex patterns
- **Proxy Engine**: Handles request forwarding and content replacement
- **Content Manager**: Manages local file and remote URL content sources with caching
- **Round-Robin Manager**: Implements load balancing algorithms
- **Configuration Manager**: Handles TOML config parsing and validation

## Testing Results

✅ **Verified Working Features:**
- HTTP request routing and forwarding
- Round-robin load balancing (confirmed switching between httpbin.org and jsonplaceholder.typicode.com)
- Health check endpoint responding correctly
- Structured logging with request tracing
- Configuration file parsing and validation
- Content replacement setup (files created and configured)

## Development Status

This is Phase 1 of the implementation focusing on core proxy functionality. The basic HTTP forwarding, routing, and load balancing features are working correctly. Content replacement and remote sources are implemented but need further testing with appropriate endpoints.

Next phases will focus on:
1. WebUI development (React frontend)
2. API endpoints for runtime configuration
3. Real-time monitoring and metrics
4. Enhanced security and production features

## File Structure

```
ultiproxy/
├── src/
│   ├── config/          # Configuration management
│   ├── content/         # Content sources and caching
│   ├── proxy/           # Core proxy engine
│   └── main.rs          # Application entry point
├── config/
│   └── ultiproxy.toml   # Main configuration file
├── examples/            # Example content files
└── target/              # Build artifacts