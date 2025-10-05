#!/bin/bash

# BibleMan Discord Bot Startup Script
# This script starts the Discord bot with proper environment setup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Node.js is installed
check_nodejs() {
    if ! command_exists node; then
        print_error "Node.js is not installed!"
        print_status "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
}

# Function to check if npm is installed
check_npm() {
    if ! command_exists npm; then
        print_error "npm is not installed!"
        print_status "Please install npm (usually comes with Node.js)"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_success "npm version: $NPM_VERSION"
}

# Function to check if .env file exists
check_env_file() {
    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        print_status "Please run the setup script first:"
        print_status "  node setup.js"
        exit 1
    fi
    print_success ".env file found"
}

# Function to check if dependencies are installed
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies not installed. Installing now..."
        npm install
        print_success "Dependencies installed"
    else
        print_success "Dependencies already installed"
    fi
}

# Function to validate environment variables
validate_env() {
    print_status "Validating environment variables..."
    
    # Check required environment variables
    required_vars=("DISCORD_TOKEN" "DISCORD_CLIENT_ID" "DISCORD_GUILD_ID" "DISCORD_CHANNEL_ID")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set!"
            exit 1
        fi
    done
    
    # Check if token is placeholder
    if [ "$DISCORD_TOKEN" = "[YOUR_BOT_TOKEN_HERE]" ]; then
        print_error "Discord token is still set to placeholder value!"
        print_status "Please update your .env file with the actual bot token"
        exit 1
    fi
    
    print_success "Environment variables validated"
}

# Function to start the bot
start_bot() {
    print_status "Starting BibleMan Discord Bot..."
    print_status "Press Ctrl+C to stop the bot"
    echo ""
    
    # Start the bot
    node src/bot.js
}

# Function to handle cleanup on exit
cleanup() {
    print_status "Shutting down bot..."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    echo "🤖 BibleMan Discord Bot Startup Script"
    echo "========================================"
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_nodejs
    check_npm
    check_env_file
    check_dependencies
    
    # Load environment variables
    print_status "Loading environment variables..."
    if [ -f .env ]; then
        set -a  # automatically export all variables
        source .env
        set +a  # stop automatically exporting
    fi
    
    # Validate environment
    validate_env
    
    echo ""
    print_success "All checks passed! Starting bot..."
    echo ""
    
    # Start the bot
    start_bot
}

# Run main function
main "$@"
