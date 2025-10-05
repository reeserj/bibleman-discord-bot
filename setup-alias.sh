#!/bin/bash

# BibleMan Discord Bot - Alias Setup Script
# This script sets up an alias so you can run 'bibleman' from anywhere

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[BibleMan]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[BibleMan]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[BibleMan]${NC} $1"
}

print_error() {
    echo -e "${RED}[BibleMan]${NC} $1"
}

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIBLEMAN_SCRIPT="$SCRIPT_DIR/bibleman"

# Function to add alias to bashrc
add_alias() {
    print_status "Setting up BibleMan alias..."
    
    # Check if alias already exists
    if grep -q "alias bibleman=" ~/.bashrc 2>/dev/null; then
        print_warning "BibleMan alias already exists in ~/.bashrc"
        print_status "Updating existing alias..."
        sed -i '/alias bibleman=/d' ~/.bashrc
    fi
    
    # Add the alias
    echo "alias bibleman='$BIBLEMAN_SCRIPT'" >> ~/.bashrc
    print_success "BibleMan alias added to ~/.bashrc"
    
    # Also add to current session
    alias bibleman="$BIBLEMAN_SCRIPT"
    print_success "BibleMan alias activated for current session"
    
    print_status "To use the alias in new terminals, run:"
    print_status "  source ~/.bashrc"
    print_status "  OR"
    print_status "  bash"
}

# Function to remove alias
remove_alias() {
    print_status "Removing BibleMan alias..."
    
    if grep -q "alias bibleman=" ~/.bashrc 2>/dev/null; then
        sed -i '/alias bibleman=/d' ~/.bashrc
        print_success "BibleMan alias removed from ~/.bashrc"
    else
        print_warning "BibleMan alias not found in ~/.bashrc"
    fi
    
    # Remove from current session
    unalias bibleman 2>/dev/null || true
    print_success "BibleMan alias removed from current session"
}

# Function to show help
show_help() {
    echo "BibleMan Discord Bot - Alias Setup"
    echo "==================================="
    echo ""
    echo "Usage: $0 {install|uninstall|help}"
    echo ""
    echo "Commands:"
    echo "  install   - Add 'bibleman' alias to your shell"
    echo "  uninstall - Remove 'bibleman' alias"
    echo "  help      - Show this help"
    echo ""
    echo "After installation, you can use:"
    echo "  bibleman start     # Start bot in foreground"
    echo "  bibleman service  # Start as background service"
    echo "  bibleman status   # Check bot status"
    echo "  bibleman logs     # View logs"
}

# Main execution
case "${1:-help}" in
    install)
        add_alias
        ;;
    uninstall)
        remove_alias
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

