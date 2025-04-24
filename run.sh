#!/bin/bash

# Exit on error
set -e

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check Python installation
if ! command_exists python3; then
  echo "❌ Python 3 is not installed. Please install it first."
  exit 1
fi

# Check PostgreSQL installation
if ! command_exists psql; then
  echo "❌ PostgreSQL is not installed. Please install it first."
  exit 1
fi

# Check if PostgreSQL service is running
if ! pg_isready > /dev/null 2>&1; then
  echo "❌ PostgreSQL service is not running. Please start it first."
  exit 1
fi

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
  echo "🔧 Creating virtual environment..."
  python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/installed" ]; then
  echo "🔧 Installing dependencies..."
  pip install -r local_requirements.txt
  touch venv/installed
else
  echo "✅ Dependencies already installed"
fi

# Run the app
echo "🚀 Starting Water Charity App..."
python run_local.py 