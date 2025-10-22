#!/bin/bash

# HelloFresh Importer - Deployment Script
# This script helps build and deploy the application

set -e

echo "🚀 HelloFresh Importer Deployment Script"
echo "========================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration:"
    echo "   - MISTRAL_API_KEY"
    echo "   - TANDOOR_URL"
    echo "   - TANDOOR_API_TOKEN"
    echo ""
    read -p "Press Enter after you've configured .env file..."
fi

# Load environment variables
source .env

# Check required environment variables
if [ -z "$MISTRAL_API_KEY" ] || [ "$MISTRAL_API_KEY" = "your_mistral_api_key_here" ]; then
    echo "❌ MISTRAL_API_KEY not set in .env file"
    exit 1
fi

if [ -z "$TANDOOR_URL" ]; then
    echo "❌ TANDOOR_URL not set in .env file"
    exit 1
fi

if [ -z "$TANDOOR_API_TOKEN" ] || [ "$TANDOOR_API_TOKEN" = "your_tandoor_api_token_here" ]; then
    echo "❌ TANDOOR_API_TOKEN not set in .env file"
    exit 1
fi

echo "✅ Environment variables configured"
echo ""

# Create uploads directory if it doesn't exist
mkdir -p backend/uploads
echo "✅ Uploads directory ready"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Build and start containers"
echo "2) Stop containers"
echo "3) Rebuild and restart containers"
echo "4) View logs"
echo "5) Check container status"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🔨 Building and starting containers..."
        docker-compose up -d --build
        echo ""
        echo "✅ Deployment complete!"
        echo "Frontend: http://$(hostname -I | awk '{print $1}'):5173"
        echo "Backend API: http://$(hostname -I | awk '{print $1}'):3001"
        ;;
    2)
        echo "🛑 Stopping containers..."
        docker-compose down
        echo "✅ Containers stopped"
        ;;
    3)
        echo "🔄 Rebuilding and restarting containers..."
        docker-compose down
        docker-compose up -d --build
        echo "✅ Containers rebuilt and restarted"
        ;;
    4)
        echo "📋 Container logs (Ctrl+C to exit):"
        docker-compose logs -f
        ;;
    5)
        echo "📊 Container status:"
        docker-compose ps
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
