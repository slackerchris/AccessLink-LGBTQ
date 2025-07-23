# AccessLink LGBTQ+ Website - Docker Setup

This directory contains a Docker-based setup for hosting the AccessLink LGBTQ+ website using nginx.

## Quick Start

### Option 1: Using Build Scripts (Recommended)

```bash
# Build locally
./build-local.sh

# Build from GitHub (requires public repo or authentication)
./build-from-git.sh
```

### Option 2: Manual Docker Commands

```bash
# Build the image
docker build -f website/Dockerfile -t accesslink-website .

# Run the container
docker run -p 3000:80 accesslink-website
```

### Option 3: Using Docker Compose

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## Files Description

- **`Dockerfile`** - Multi-stage build configuration for production-ready nginx container
- **`nginx.conf`** - Custom nginx configuration with security headers and performance optimization
- **`docker-compose.yml`** - Development environment configuration
- **`docker-compose.prod.yml`** - Production environment with resource limits and logging
- **`build-local.sh`** - Script to build Docker image from local repository
- **`build-from-git.sh`** - Script to build Docker image directly from GitHub
- **`.dockerignore`** - Excludes unnecessary files from Docker build context

## Configuration Features

### Security
- Content Security Policy (CSP) headers
- X-Frame-Options and X-Content-Type-Options headers
- Runs as non-root user (nextjs:nodejs)
- Security-hardened nginx configuration

### Performance
- Gzip compression for text assets
- Browser caching with appropriate headers
- Optimized nginx worker processes
- Health check endpoint at `/health`

### Docker Features
- Multi-stage build for minimal image size (~52MB)
- Non-root user execution
- Health checks
- Resource limits in production
- Proper logging configuration

## Environment Options

### Development
```bash
docker-compose up -d
```
- Port: 3000
- Basic logging
- Development-friendly settings

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```
- Port: 80
- Resource limits (512MB RAM, 0.5 CPU)
- JSON logging for monitoring
- Restart policy: unless-stopped

## Repository Access

### For GitHub-based builds

If the repository is private, you have these options:

1. **Make Repository Public** (Recommended for open source)
   - Go to GitHub repository settings
   - Change visibility to public

2. **Use SSH Authentication**
   - Configure SSH key: `ssh -T git@github.com`
   - Update script to use SSH URL

3. **Use Personal Access Token**
   - Create token at https://github.com/settings/tokens
   - Use: `https://token@github.com/owner/repo.git`

## Health Monitoring

The nginx configuration includes a health endpoint:

```bash
# Check health
curl http://localhost:3000/health
# Should return: OK

# Docker health check
docker ps
# STATUS should show "(healthy)"
```

## Troubleshooting

### Build Issues
- Ensure Docker is running: `docker --version`
- Check that you're in the repository root
- Verify files exist: `ls -la website/`

### Runtime Issues
- Check logs: `docker logs <container-id>`
- Verify port availability: `lsof -i :3000`
- Test health endpoint: `curl http://localhost:3000/health`

### Performance
- The build context is optimized with `.dockerignore`
- Build time should be ~5 seconds for local builds
- Image size is optimized to ~52MB

## Commands Reference

```bash
# Build image
docker build -f website/Dockerfile -t accesslink-website .

# Run container
docker run -p 3000:80 accesslink-website

# View logs
docker logs <container-id>

# Execute shell in container
docker exec -it <container-id> /bin/sh

# Remove container
docker rm -f <container-id>

# Remove image
docker rmi accesslink-website
```
├── css/                   # Stylesheets
├── js/                    # JavaScript files
├── assets/                # Images, icons, fonts
└── README.md              # This file
```

## 🛠️ Docker Commands

### Basic Commands

```bash
# Build the image
docker build -t accesslink-website .

# Run a container
docker run -d -p 3000:8080 --name accesslink-website accesslink-website

# View logs
docker logs accesslink-website

# Stop and remove container
docker stop accesslink-website && docker rm accesslink-website
```

### Docker Compose Commands

```bash
# Start services (development)
docker-compose up -d

# Start services (production)
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Scale the service (production)
docker-compose -f docker-compose.prod.yml up --scale accesslink-website=3 -d
```

## 🔧 Configuration

### Environment Variables

- `NODE_ENV`: Set to `production` for production builds
- `NGINX_ENVSUBST_OUTPUT_DIR`: nginx configuration directory

### nginx Configuration

The custom nginx configuration includes:

- **Gzip compression** for better performance
- **Security headers** (CSP, XSS protection, etc.)
- **Caching rules** for static assets
- **Health check endpoint** at `/health`
- **SPA support** with fallback to `index.html`
- **CORS headers** for API communication

### Ports

- **Development**: `localhost:3000` → `container:8080`
- **Production**: `localhost:80` → `container:8080`

## 🔒 Security Features

- Runs as non-root user (`nextjs:nodejs`)
- Security headers included in nginx config
- Hidden nginx version
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

## 📊 Monitoring & Health Checks

### Health Check Endpoint

Visit `/health` to check if the service is running:

```bash
# Development
curl http://localhost:3000/health

# Production
curl http://localhost/health
```

### Docker Health Checks

Both development and production configurations include health checks that:

- Check every 30 seconds
- Timeout after 10 seconds
- Retry 3 times before marking unhealthy
- Wait 40 seconds before first check

## 🚀 Production Deployment

### Prerequisites

- Docker and Docker Compose installed
- Port 80 available (or modify docker-compose.prod.yml)

### Deployment Steps

1. **Build and deploy**:
   ```bash
   ./deploy-prod.sh
   ```

2. **Verify deployment**:
   ```bash
   curl http://localhost/health
   ```

3. **Monitor logs**:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

### Production Considerations

- **SSL/TLS**: Add a reverse proxy (nginx, Traefik) for HTTPS
- **Domain**: Update the Traefik labels in `docker-compose.prod.yml`
- **Scaling**: Use `docker-compose up --scale accesslink-website=N`
- **Load Balancing**: Consider adding a load balancer for multiple replicas

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Find what's using the port
   lsof -i :3000
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Permission denied**:
   ```bash
   # Make scripts executable
   chmod +x *.sh
   ```

3. **Build failures**:
   ```bash
   # Clean Docker cache
   docker system prune -a
   ```

### Debug Commands

```bash
# Check running containers
docker ps

# Execute commands in container
docker exec -it accesslink-lgbtq-website sh

# View nginx logs
docker exec accesslink-lgbtq-website tail -f /var/log/nginx/access.log

# Test nginx configuration
docker exec accesslink-lgbtq-website nginx -t
```

## 🔄 Updates

To update the website:

1. **Update files** in the website directory
2. **Rebuild** the container:
   ```bash
   docker-compose up --build -d
   ```
3. **Verify** the changes at the health endpoint

## 📈 Performance

The Docker setup includes several performance optimizations:

- **Gzip compression** for text files
- **Caching headers** for static assets
- **Efficient nginx configuration**
- **Small Alpine Linux base image**
- **Resource limits** in production

## 🌐 Domain & SSL

For production with a custom domain:

1. **Update docker-compose.prod.yml** with your domain
2. **Add SSL termination** (recommended: Traefik or nginx proxy)
3. **Update CSP headers** in nginx.conf if needed

---

**Need help?** Check the logs with `docker-compose logs -f` or open an issue in the repository.
