#!/bin/bash

# Langgoku E-Commerce - Installation Script
# Run this script to quickly setup the project

echo "🚀 Langgoku E-Commerce - Setup Script"
echo "======================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js belum install!"
    echo "Download dari: https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check installation
if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Installation failed"
    exit 1
fi
echo ""

# Create .env.local from example
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    cp .env.local.example .env.local
    echo "✓ .env.local created"
    echo "⚠️  Please edit .env.local with your Google API credentials"
else
    echo "✓ .env.local exists"
fi
echo ""

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local dengan Google Sheets ID dan API Key"
echo "2. npm run dev"
echo "3. Open http://localhost:3000"
echo ""
echo "For more info, see QUICKSTART.md"
