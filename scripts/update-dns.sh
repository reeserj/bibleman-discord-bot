#!/bin/bash

# DuckDNS Dynamic DNS Update Script
# Replace YOUR_DOMAIN and YOUR_TOKEN with your actual values

DOMAIN="biblemanbot"  # Your subdomain (without .duckdns.org)
TOKEN="2b040bd6-0dc6-4263-9617-b3c4ab1f7c0d"  # Your DuckDNS token

# Update DuckDNS
curl -s "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN&ip="

# Get current public IP
CURRENT_IP=$(curl -s ifconfig.me)
echo "DuckDNS updated for $DOMAIN.duckdns.org"
echo "Current public IP: $CURRENT_IP"
