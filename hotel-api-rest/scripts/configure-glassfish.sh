#!/bin/bash
# Configure GlassFish JDBC resources
# Adapted from .devcontainer/setup.sh

set -e

# Use environment variables with defaults
MYSQL_USER=${MYSQL_USER:-root}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-root}
MYSQL_DATABASE=${MYSQL_DATABASE:-hotel_reservation_system}
MYSQL_HOST=${MYSQL_HOST:-localhost}
MYSQL_PORT=${MYSQL_PORT:-3306}

echo "═══════════════════════════════════════════════════════"
echo "  Configuring GlassFish JDBC Resources"
echo "═══════════════════════════════════════════════════════"
echo ""

# Clean up any existing resources
echo "Step 1: Cleaning existing resources..."
asadmin delete-jdbc-resource hotel 2>/dev/null && echo "  ✓ Removed existing JDBC resource" || echo "  → No existing JDBC resource found"
asadmin delete-jdbc-connection-pool HotelReservationPool 2>/dev/null && echo "  ✓ Removed existing connection pool" || echo "  → No existing connection pool found"
echo ""

# Create connection pool
echo "Step 2: Creating JDBC connection pool..."
asadmin create-jdbc-connection-pool \
  --datasourceclassname com.mysql.cj.jdbc.MysqlDataSource \
  --restype javax.sql.DataSource \
  --property user=${MYSQL_USER}:password=${MYSQL_PASSWORD}:databaseName=${MYSQL_DATABASE}:serverName=${MYSQL_HOST}:port=${MYSQL_PORT}:useSSL=false:serverTimezone=UTC \
  HotelReservationPool

echo "  ✓ Connection pool created"
echo ""

# Create JNDI resource
echo "Step 3: Creating JDBC resource (JNDI: hotel)..."
asadmin create-jdbc-resource \
  --connectionpoolid HotelReservationPool \
  hotel

echo "  ✓ JDBC resource created"
echo ""

# Test connection
echo "Step 4: Testing JDBC connection pool..."
if asadmin ping-connection-pool HotelReservationPool 2>/dev/null | grep -q "successfully"; then
    echo "  ✓ Connection pool test successful"
else
    echo "  ⚠ Connection pool test failed"
    exit 1
fi

echo ""
echo "✓ GlassFish JDBC resources configured successfully"
echo ""

