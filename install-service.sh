#!/bin/bash

# BibleMan Discord Bot - Systemd Service Installer
# This script installs the bot as a systemd service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SERVICE_NAME="bibleman-bot"
SERVICE_FILE="bibleman-bot.service"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYSTEMD_DIR="/etc/systemd/system"

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

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to install the service
install_service() {
    print_status "Installing BibleMan Discord Bot as a systemd service..."
    
    # Copy service file to systemd directory
    cp "$SCRIPT_DIR/$SERVICE_FILE" "$SYSTEMD_DIR/"
    print_success "Service file copied to $SYSTEMD_DIR"
    
    # Update the service file with correct paths
    sed -i "s|WorkingDirectory=.*|WorkingDirectory=$SCRIPT_DIR|g" "$SYSTEMD_DIR/$SERVICE_FILE"
    sed -i "s|ExecStart=.*|ExecStart=$SCRIPT_DIR/src/bot.js|g" "$SYSTEMD_DIR/$SERVICE_FILE"
    sed -i "s|EnvironmentFile=.*|EnvironmentFile=$SCRIPT_DIR/.env|g" "$SYSTEMD_DIR/$SERVICE_FILE"
    sed -i "s|ReadWritePaths=.*|ReadWritePaths=$SCRIPT_DIR|g" "$SYSTEMD_DIR/$SERVICE_FILE"
    
    # Update user/group to current user
    local current_user=$(logname 2>/dev/null || echo "$SUDO_USER")
    local current_group=$(id -gn "$current_user" 2>/dev/null || echo "$current_user")
    sed -i "s|User=.*|User=$current_user|g" "$SYSTEMD_DIR/$SERVICE_FILE"
    sed -i "s|Group=.*|Group=$current_group|g" "$SYSTEMD_DIR/$SERVICE_FILE"
    
    print_success "Service file configured for user: $current_user"
    
    # Reload systemd
    systemctl daemon-reload
    print_success "Systemd configuration reloaded"
    
    # Enable the service
    systemctl enable "$SERVICE_NAME"
    print_success "Service enabled (will start on boot)"
    
    print_status "Service installation complete!"
    echo ""
    print_status "To manage the service:"
    print_status "  Start:   sudo systemctl start $SERVICE_NAME"
    print_status "  Stop:    sudo systemctl stop $SERVICE_NAME"
    print_status "  Status:  sudo systemctl status $SERVICE_NAME"
    print_status "  Logs:    sudo journalctl -u $SERVICE_NAME -f"
    print_status "  Restart: sudo systemctl restart $SERVICE_NAME"
}

# Function to uninstall the service
uninstall_service() {
    print_status "Uninstalling BibleMan Discord Bot service..."
    
    # Stop and disable the service
    systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    systemctl disable "$SERVICE_NAME" 2>/dev/null || true
    
    # Remove service file
    rm -f "$SYSTEMD_DIR/$SERVICE_FILE"
    print_success "Service file removed"
    
    # Reload systemd
    systemctl daemon-reload
    print_success "Systemd configuration reloaded"
    
    print_success "Service uninstalled successfully!"
}

# Function to show service status
show_status() {
    print_status "BibleMan Discord Bot Service Status:"
    systemctl status "$SERVICE_NAME" --no-pager
}

# Function to show help
show_help() {
    echo "BibleMan Discord Bot - Systemd Service Manager"
    echo "Usage: sudo $0 {install|uninstall|status|help}"
    echo ""
    echo "Commands:"
    echo "  install   - Install the bot as a systemd service"
    echo "  uninstall - Remove the systemd service"
    echo "  status    - Show service status"
    echo "  help      - Show this help message"
    echo ""
    echo "After installation, you can manage the service with:"
    echo "  sudo systemctl start bibleman-bot"
    echo "  sudo systemctl stop bibleman-bot"
    echo "  sudo systemctl restart bibleman-bot"
    echo "  sudo systemctl status bibleman-bot"
    echo "  sudo journalctl -u bibleman-bot -f"
}

# Main execution
case "${1:-help}" in
    install)
        check_root
        install_service
        ;;
    uninstall)
        check_root
        uninstall_service
        ;;
    status)
        show_status
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

