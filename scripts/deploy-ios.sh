#!/bin/bash

# AccessLink LGBTQ+ iOS Deployment Script
# Run this script on a macOS machine with Xcode installed

echo "🌈 AccessLink LGBTQ+ iOS Deployment Script"
echo "=========================================="

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "❌ Error: iOS builds require macOS. Current OS: $OSTYPE"
  echo "📱 Use EAS Build for cloud building: eas build --platform ios"
  exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
  echo "❌ Error: Xcode is not installed. Please install Xcode from the App Store."
  exit 1
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
  echo "📦 Installing EAS CLI..."
  npm install -g eas-cli
fi

# Ensure dependencies are installed
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Running type checks..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ Type check failed. Please fix TypeScript errors before building."
  exit 1
fi

# Run linting
echo "🧹 Running linter..."
npm run lint
if [ $? -ne 0 ]; then
  echo "⚠️  Linting issues found. Consider fixing before deployment."
fi

# Choose build type
echo ""
echo "Select build type:"
echo "1) Development (for testing)"
echo "2) Preview (internal distribution)"  
echo "3) Production (App Store)"
echo "4) Local build"
read -p "Enter choice (1-4): " choice

case $choice in
  1)
    echo "🔨 Building development version..."
    eas build --platform ios --profile development
    ;;
  2)
    echo "🔨 Building preview version..."
    eas build --platform ios --profile preview
    ;;
  3)
    echo "🔨 Building production version..."
    eas build --platform ios --profile production
    ;;
  4)
    echo "🔨 Building locally..."
    eas build --platform ios --local
    ;;
  *)
    echo "❌ Invalid choice. Exiting."
    exit 1
    ;;
esac

echo ""
echo "✅ Build process completed!"
echo "📱 Check the EAS dashboard for build status: https://expo.dev"
echo "🌈 AccessLink LGBTQ+ is ready to help the community!"
