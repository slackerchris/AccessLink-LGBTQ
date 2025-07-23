#!/bin/bash

# Deploy AccessLink LGBTQ+ website to production
echo "🚀 Deploying AccessLink LGBTQ+ Website to Production..."

# Stop existing production containers
docker-compose -f docker-compose.prod.yml down

# Build and start production containers
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for container to be healthy
echo "⏳ Waiting for production container to be healthy..."
sleep 10

# Check if container is running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ AccessLink LGBTQ+ Website is deployed and running in production!"
    echo "🌐 Visit: http://localhost"
    echo "📊 Health check: http://localhost/health"
    echo ""
    echo "Production commands:"
    echo "- View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "- Stop: docker-compose -f docker-compose.prod.yml down"
    echo "- Scale: docker-compose -f docker-compose.prod.yml up --scale accesslink-website=2 -d"
else
    echo "❌ Failed to deploy the website"
    echo "Check logs with: docker-compose -f docker-compose.prod.yml logs"
fi
