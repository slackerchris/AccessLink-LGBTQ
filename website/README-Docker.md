# AccessLink LGBTQ+ Website - Docker Setup

This directory contains the Docker configuration for the AccessLink LGBTQ+ website, a static site served using nginx.

## 🐳 Docker Architecture

- **Base Image**: `nginx:alpine` - Lightweight and secure
- **Web Server**: nginx with custom configuration
- **Port**: 8080 (internal), mapped to 3000 (development) or 80 (production)
- **Security**: Runs as non-root user, includes security headers
- **Health Checks**: Built-in health monitoring

## 🚀 Quick Start

### Development Mode

```bash
# Start the website in development mode
./start-dev.sh

# Or manually:
docker-compose up --build -d

# View at: http://localhost:3000
```

### Production Mode

```bash
# Deploy to production
./deploy-prod.sh

# Or manually:
docker-compose -f docker-compose.prod.yml up --build -d

# View at: http://localhost (port 80)
```

## 📁 File Structure

```
website/
├── Dockerfile              # Docker image configuration
├── docker-compose.yml      # Development Docker Compose
├── docker-compose.prod.yml # Production Docker Compose
├── nginx.conf              # Custom nginx configuration
├── .dockerignore           # Files to exclude from Docker build
├── start-dev.sh           # Development startup script
├── deploy-prod.sh         # Production deployment script
├── index.html             # Main website file
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
