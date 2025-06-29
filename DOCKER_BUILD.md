# Docker Build & Deploy

## GitHub Actions自动构建

此仓库配置了GitHub Actions自动构建和推送Docker镜像到GitHub Container Registry。

### 触发条件

- 推送到 `main` 或 `master` 分支
- 创建版本标签 (如 `v1.0.0`)
- 创建Pull Request

### 构建的镜像

1. **后端镜像**: `ghcr.io/[username]/[repo]/ultiproxy`
2. **前端镜像**: `ghcr.io/[username]/[repo]/ultiproxy-web`

### 镜像标签策略

- `latest` - 主分支最新版本
- `main` - 主分支构建
- `v1.0.0` - 版本标签
- `1.0` - 主版本号
- `pr-123` - Pull Request构建

### 使用构建的镜像

```bash
# 拉取最新镜像
docker pull ghcr.io/[username]/[repo]/ultiproxy:latest
docker pull ghcr.io/[username]/[repo]/ultiproxy-web:latest

# 运行容器
docker run -d -p 8080:8080 ghcr.io/[username]/[repo]/ultiproxy:latest
docker run -d -p 80:80 ghcr.io/[username]/[repo]/ultiproxy-web:latest
```

### 本地构建

```bash
# 构建后端镜像
docker build -t ultiproxy .

# 构建前端镜像
docker build -t ultiproxy-web ./web-ui

# 使用docker-compose
docker-compose up --build
```

### 权限设置

GitHub Actions使用 `GITHUB_TOKEN` 自动推送镜像，无需额外配置。镜像默认为私有，可在仓库设置中修改为公开。