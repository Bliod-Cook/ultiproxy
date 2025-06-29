# UltiProxy Deployment Guide

This guide covers deploying UltiProxy using Docker containers for both development and production environments.

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (Windows/macOS) or **Docker Engine** (Linux)
- **Docker Compose** v2.0+
- **Git** (to clone the repository)

### Development Deployment

```bash
# Linux/macOS
./deploy.sh dev

# Windows PowerShell
.\deploy.ps1 dev
```

### Production Deployment

```bash
# Linux/macOS
./deploy.sh prod

# Windows PowerShell
.\deploy.ps1 prod
```

## 📋 Deployment Options

### 1. Development Environment

**Features:**
- Hot reload for development
- Debug logging enabled
- Source code mounted as volumes
- Exposed ports for direct access

**Access Points:**
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

**Command:**
```bash
docker-compose up --build -d
```

### 2. Production Environment

**Features:**
- Optimized builds with multi-stage Dockerfiles
- Resource limits and health checks
- Security hardening (non-root users)
- Minimal attack surface

**Access Points:**
- **Frontend**: http://localhost (or your domain)
- **Backend API**: http://localhost:8080 (internal)
- **Health Check**: http://localhost:8080/health

**Command:**
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (Nginx +      │────│   (Rust App)    │
│   React SPA)    │    │                 │
│   Port: 80      │    │   Port: 8080    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              Docker Network
```

### Container Details

#### Backend Container (Rust)
- **Base Image**: `rust:1.75-alpine` (builder) → `alpine:latest` (runtime)
- **Features**: Multi-stage build, non-root user, health checks
- **Ports**: 8080 (HTTP API + WebSocket)
- **Volumes**: Configuration and examples mounted read-only

#### Frontend Container (React + Nginx)
- **Base Image**: `node:18-alpine` (builder) → `nginx:alpine` (runtime)
- **Features**: Optimized Nginx config, reverse proxy, static file serving
- **Ports**: 80 (HTTP), 443 (HTTPS ready)
- **Proxy**: Routes `/api/*` and `/ws/*` to backend

## 🔧 Configuration

### Environment Variables

#### Backend (Rust)
```bash
RUST_LOG=info          # Logging level (debug, info, warn, error)
```

#### Frontend (Nginx)
- Nginx configuration in `web-ui/nginx.conf`
- Reverse proxy settings for API and WebSocket

### Volume Mounts

```yaml
volumes:
  - ./config:/app/config:ro      # Configuration files
  - ./examples:/app/examples:ro  # Example content files
```

### Network Configuration

- **Network Name**: `ultiproxy-network` (dev) / `ultiproxy-network-prod` (prod)
- **Driver**: Bridge
- **Internal Communication**: Backend accessible as `backend:8080`

## 🛠️ Deployment Scripts

### Linux/macOS (`deploy.sh`)

```bash
./deploy.sh [COMMAND]

Commands:
  dev      Deploy in development mode
  prod     Deploy in production mode
  stop     Stop all containers
  status   Show container status
  logs     Show container logs
  cleanup  Clean up Docker resources
  help     Show help message
```

### Windows PowerShell (`deploy.ps1`)

```powershell
.\deploy.ps1 [COMMAND]

# Same commands as Linux/macOS version
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints

- **Backend**: `http://localhost:8080/health`
- **Frontend**: `http://localhost/` (Nginx status)

### Container Health Checks

Both containers include built-in health checks:
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 10-40 seconds

### Viewing Logs

```bash
# Real-time logs
./deploy.sh logs

# Or directly with Docker
docker-compose logs -f
```

## 🔒 Security Features

### Container Security

- **Non-root users** in both containers
- **Read-only volumes** for configuration
- **Minimal base images** (Alpine Linux)
- **Security headers** in Nginx configuration

### Network Security

- **Internal network** for container communication
- **Reverse proxy** hides backend from direct access
- **CORS configuration** for cross-origin requests

### Nginx Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 🚀 Production Deployment

### Resource Limits

Production containers include resource limits:

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

### SSL/TLS Configuration

For HTTPS in production:

1. **Obtain SSL certificates** (Let's Encrypt recommended)
2. **Mount certificates** in Nginx container
3. **Update Nginx config** for SSL termination
4. **Redirect HTTP to HTTPS**

Example SSL configuration:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;
    # ... rest of configuration
}
```

### Reverse Proxy Setup

For production with external reverse proxy (Traefik, Nginx, etc.):

1. **Remove port mappings** from docker-compose.prod.yml
2. **Configure external proxy** to route to containers
3. **Set up SSL termination** at proxy level
4. **Configure health checks** for load balancing

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :80
netstat -tulpn | grep :8080

# Stop conflicting services
sudo systemctl stop nginx  # If system Nginx is running
```

#### 2. Docker Build Fails
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### 3. Container Won't Start
```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps
```

#### 4. WebSocket Connection Issues
- Ensure backend container is healthy
- Check Nginx proxy configuration
- Verify network connectivity between containers

### Debug Commands

```bash
# Enter running container
docker exec -it ultiproxy-backend sh
docker exec -it ultiproxy-frontend sh

# Check container resources
docker stats

# Inspect container configuration
docker inspect ultiproxy-backend
```

## 📈 Performance Optimization

### Backend Optimization

- **Release builds** with optimizations enabled
- **Multi-stage builds** for smaller images
- **Alpine Linux** for minimal footprint
- **Health checks** for proper load balancing

### Frontend Optimization

- **Gzip compression** enabled in Nginx
- **Static asset caching** with long expiry
- **Bundle optimization** with Vite
- **Code splitting** for faster loading

### Docker Optimization

- **Layer caching** with proper Dockerfile ordering
- **Multi-stage builds** to reduce image size
- **.dockerignore** files to exclude unnecessary files
- **Resource limits** to prevent resource exhaustion

## 🔄 Updates & Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
./deploy.sh prod

# Or for development
./deploy.sh dev
```

### Database Migrations

Currently, UltiProxy uses file-based configuration. For future database integration:

1. **Add migration scripts** to deployment process
2. **Include database container** in docker-compose
3. **Set up backup procedures** for data persistence

### Backup Procedures

```bash
# Backup configuration
tar -czf ultiproxy-config-$(date +%Y%m%d).tar.gz config/ examples/

# Backup Docker volumes (if using persistent storage)
docker run --rm -v ultiproxy_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz /data
```

## 📞 Support

For deployment issues:

1. **Check logs** using deployment scripts
2. **Verify prerequisites** (Docker, Docker Compose)
3. **Review configuration** files
4. **Check network connectivity** between containers
5. **Consult troubleshooting section** above

## 🎯 Next Steps

After successful deployment:

1. **Configure forwarding rules** via the web interface
2. **Set up monitoring** and alerting
3. **Configure SSL/TLS** for production
4. **Set up backup procedures** for configuration
5. **Plan scaling strategy** for high availability