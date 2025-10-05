#!/bin/bash

# BibleMan Discord Bot Service Script
# This script manages the bot as a background service with process management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BOT_NAME="bibleman-bot"
PID_FILE="/tmp/${BOT_NAME}.pid"
LOG_FILE="logs/bot.log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

# Function to check if bot is running
is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# Function to start the bot
start_bot() {
    if is_running; then
        print_warning "Bot is already running (PID: $(cat $PID_FILE))"
        return 1
    fi
    
    print_status "Starting BibleMan Discord Bot as a service..."
    
    # Create logs directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Change to script directory
    cd "$SCRIPT_DIR"
    
    # Start the bot in background and save PID
    nohup node src/bot.js > "$LOG_FILE" 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    
    # Wait a moment to check if it started successfully
    sleep 2
    
    if is_running; then
        print_success "Bot started successfully (PID: $pid)"
        print_status "Logs are being written to: $LOG_FILE"
        print_status "To view logs: tail -f $LOG_FILE"
        print_status "To stop the bot: $0 stop"
    else
        print_error "Failed to start bot. Check logs: $LOG_FILE"
        rm -f "$PID_FILE"
        return 1
    fi
}

# Function to stop the bot
stop_bot() {
    if ! is_running; then
        print_warning "Bot is not running"
        return 1
    fi
    
    local pid=$(cat "$PID_FILE")
    print_status "Stopping bot (PID: $pid)..."
    
    # Try graceful shutdown first
    kill -TERM "$pid" 2>/dev/null || true
    
    # Wait for graceful shutdown
    local count=0
    while [ $count -lt 10 ] && is_running; do
        sleep 1
        count=$((count + 1))
    done
    
    # Force kill if still running
    if is_running; then
        print_warning "Graceful shutdown failed, forcing stop..."
        kill -KILL "$pid" 2>/dev/null || true
        sleep 1
    fi
    
    if is_running; then
        print_error "Failed to stop bot"
        return 1
    else
        print_success "Bot stopped successfully"
        rm -f "$PID_FILE"
    fi
}

# Function to restart the bot
restart_bot() {
    print_status "Restarting bot..."
    stop_bot
    sleep 2
    start_bot
}

# Function to show bot status
show_status() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        print_success "Bot is running (PID: $pid)"
        print_status "Log file: $LOG_FILE"
        if [ -f "$LOG_FILE" ]; then
            print_status "Last 5 lines of log:"
            tail -n 5 "$LOG_FILE" | sed 's/^/  /'
        fi
    else
        print_warning "Bot is not running"
    fi
}

# Function to show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        print_status "Showing bot logs (press Ctrl+C to exit):"
        tail -f "$LOG_FILE"
    else
        print_warning "Log file not found: $LOG_FILE"
    fi
}

# Function to show help
show_help() {
    echo "BibleMan Discord Bot Service Manager"
    echo "Usage: $0 {start|stop|restart|status|logs|help}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the bot as a background service"
    echo "  stop    - Stop the running bot"
    echo "  restart - Restart the bot"
    echo "  status  - Show bot status and recent logs"
    echo "  logs    - Show live log output"
    echo "  help    - Show this help message"
}

# Main script logic
case "${1:-help}" in
    start)
        start_bot
        ;;
    stop)
        stop_bot
        ;;
    restart)
        restart_bot
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

