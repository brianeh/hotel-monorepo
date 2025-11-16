#!/bin/bash
# Ensure services are running
# This script checks and starts services if they're not running

# Only run in interactive shells and only once per session
if [ -z "$SERVICES_CHECKED" ]; then
    export SERVICES_CHECKED=1
    
    # Check MySQL
    if ! sudo service mysql status >/dev/null 2>&1; then
        echo "Starting MySQL..."
        sudo service mysql start >/dev/null 2>&1
        sudo chmod 755 /var/run/mysqld/ 2>/dev/null || true
    fi
    
    # Check GlassFish
    if ! asadmin list-domains 2>/dev/null | grep -q "domain1 running"; then
        echo "Starting GlassFish domain1..."
        asadmin start-domain domain1 >/dev/null 2>&1
        if asadmin list-domains 2>/dev/null | grep -q "domain1 running"; then
            echo "✓ GlassFish started"
        fi
    fi
fi

