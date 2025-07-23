#!/bin/bash

#!/bin/bash

# Build AccessLink LGBTQ+ Website Docker Image from GitHub
# This script builds the Docker image directly from the GitHub repository
# without needing to clone it locally first

set -e  # Exit on any error

# Configuration
REPO_URL="https://github.com/slackerchris/AccessLink-LGBTQ.git#dev"
IMAGE_NAME="accesslink-website"
DOCKERFILE_PATH="website/Dockerfile"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TAG="${IMAGE_NAME}:${TIMESTAMP}"

echo "🚀 Building AccessLink LGBTQ+ Website directly from GitHub..."
echo ""

# Check if repository is private and provide instructions
echo "📋 IMPORTANT: Repository Access Requirements"
echo "   This repository appears to be private. You have several options:"
echo ""
echo "   Option 1 - Make Repository Public (Recommended for open source):"
echo "   • Go to https://github.com/slackerchris/AccessLink-LGBTQ/settings"
echo "   • Scroll to 'Danger Zone' and click 'Change repository visibility'"
echo "   • Select 'Make public'"
echo ""
echo "   Option 2 - Use SSH instead of HTTPS:"
echo "   • Ensure your SSH key is configured: ssh -T git@github.com"
echo "   • Use SSH URL: git@github.com:slackerchris/AccessLink-LGBTQ.git#dev"
echo ""
echo "   Option 3 - Use Personal Access Token:"
echo "   • Create token at https://github.com/settings/tokens"
echo "   • Use: https://token@github.com/slackerchris/AccessLink-LGBTQ.git#dev"
echo ""
echo "📥 Attempting to build from: ${REPO_URL}"
echo "📄 Using Dockerfile at: ${DOCKERFILE_PATH}"
echo ""

# Build the Docker image from GitHub
if docker build --file "${DOCKERFILE_PATH}" --tag "${TAG}" --tag "${IMAGE_NAME}:latest" "${REPO_URL}"; then
    echo ""
    echo "✅ Build successful!"
    echo "🏷️  Tagged as: ${TAG}"
    echo "🏷️  Tagged as: ${IMAGE_NAME}:latest"
    echo ""
    echo "🚀 To run the website:"
    echo "   docker run -p 3000:80 ${IMAGE_NAME}:latest"
    echo ""
    echo "📖 Or use docker-compose:"
    echo "   docker-compose up -d"
    echo ""
    echo "🌐 Website will be available at: http://localhost:3000"
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   • Ensure the repository is public OR"
    echo "   • Use SSH authentication OR"
    echo "   • Use a personal access token OR"
    echo "   • Clone the repository locally and use: docker build -f website/Dockerfile -t ${IMAGE_NAME} ."
    echo ""
    exit 1
fi
