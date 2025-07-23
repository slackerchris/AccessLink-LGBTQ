#!/bin/bash

# Build and start the AccessLink LGBTQ+ website in development mode
echo "🏗️  Building AccessLink LGBTQ+ Website..."

# Stop any existing containers
docker-compose down

# Build and start the container
docker-compose up --build -d

# Wait for container to be healthy
echo "⏳ Waiting for container to be healthy..."
sleep 5

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ AccessLink LGBTQ+ Website is running!"
    echo "🌐 Visit: http://localhost:3000"
    echo "📊 Health check: http://localhost:3000/health"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"
else
    echo "❌ Failed to start the website"
    echo "Check logs with: docker-compose logs"
fi
