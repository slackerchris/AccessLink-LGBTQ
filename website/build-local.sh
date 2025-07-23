#!/bin/bash

# Build AccessLink LGBTQ+ Website Docker Image from Local Repository
# This script builds the Docker image from the current local repository

set -e  # Exit on any error

# Configuration
IMAGE_NAME="accesslink-website"
DOCKERFILE_PATH="website/Dockerfile"
BUILD_CONTEXT="."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TAG="${IMAGE_NAME}:${TIMESTAMP}"

echo "🚀 Building AccessLink LGBTQ+ Website from local repository..."
echo "📁 Build context: ${BUILD_CONTEXT}"
echo "📄 Using Dockerfile at: ${DOCKERFILE_PATH}"
echo ""

# Navigate to repository root
cd "$(dirname "$0")/.."

# Build the Docker image
if docker build --file "${DOCKERFILE_PATH}" --tag "${TAG}" --tag "${IMAGE_NAME}:latest" "${BUILD_CONTEXT}"; then
    echo ""
    echo "✅ Build successful!"
    echo "🏷️  Tagged as: ${TAG}"
    echo "🏷️  Tagged as: ${IMAGE_NAME}:latest"
    echo ""
    echo "🚀 To run the website:"
    echo "   docker run -p 3000:80 ${IMAGE_NAME}:latest"
    echo ""
    echo "📖 Or use docker-compose:"
    echo "   docker-compose -f website/docker-compose.yml up -d"
    echo ""
    echo "🌐 Website will be available at: http://localhost:3000"
    echo ""
    echo "📋 Available images:"
    docker images | grep "${IMAGE_NAME}" || echo "   No images found"
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   • Check that you're in the repository root directory"
    echo "   • Ensure Docker is running: docker --version"
    echo "   • Verify Dockerfile exists: ls -la website/Dockerfile"
    exit 1
fi
