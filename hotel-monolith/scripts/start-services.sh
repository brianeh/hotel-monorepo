#!/bin/bash
# Main orchestrator script for Docker Compose
# Coordinates MySQL startup, database init, GlassFish startup, configuration, and deployment

set -e

echo "═══════════════════════════════════════════════════════"
echo "  Hotel Reservation System - Container Startup"
echo "═══════════════════════════════════════════════════════"
echo ""

# Ensure we're in the correct directory
cd /workspaces/hotel-modernization/hotel-monolith

# Step 1: Copy build properties to project directories
echo "Step 1: Copying build property files..."
if [ -d "/tmp/build-properties" ]; then
    cp /tmp/build-properties/ejb.properties HotelReservation-ejb/build.properties 2>/dev/null || true
    cp /tmp/build-properties/war.properties HotelReservation-war/build.properties 2>/dev/null || true
    cp /tmp/build-properties/root.properties build.properties 2>/dev/null || true
    echo "✓ Build properties configured"
else
    echo "⚠ Build properties directory not found, skipping..."
fi
echo ""

# Step 2: Start MySQL service and wait for readiness
echo "Step 2: Starting MySQL service..."
sudo service mysql start
echo "  Waiting for MySQL to be ready..."
sleep 15

# Verify MySQL is running
if ! sudo service mysql status > /dev/null 2>&1; then
    echo "✗ MySQL failed to start"
    exit 1
fi
echo "✓ MySQL is running"
echo ""

# Step 3: Initialize database
echo "Step 3: Initializing database..."
bash scripts/init-database.sh
echo ""

# Step 4: Clean OSGi cache to prevent corruption issues
echo "Step 4: Cleaning OSGi cache..."
rm -rf /opt/glassfish4/glassfish/domains/domain1/osgi-cache/* 2>/dev/null || true
echo "✓ OSGi cache cleaned"
echo ""

# Step 5: Start GlassFish domain
echo "Step 5: Starting GlassFish domain..."
# Kill any stale GlassFish processes
pkill -9 -f "glassfish.jar" 2>/dev/null || true
sleep 2

asadmin start-domain domain1
echo "  Waiting for GlassFish to fully start..."
sleep 10

# Verify GlassFish is running
if ! asadmin list-domains 2>/dev/null | grep -q "domain1 running"; then
    echo "✗ GlassFish failed to start"
    exit 1
fi
echo "✓ GlassFish is running"
echo ""

# Step 6: Configure GlassFish JDBC resources
echo "Step 6: Configuring GlassFish JDBC resources..."
bash scripts/configure-glassfish.sh
echo ""

# Step 7: Build and deploy application
echo "Step 7: Building and deploying application..."
bash scripts/build-and-deploy.sh
echo ""

# Step 8: Keep container running
echo "═══════════════════════════════════════════════════════"
echo "  ✓ All services started successfully!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Container is ready. Keeping GlassFish running..."
echo ""
echo "Access URLs:"
echo "  Application:  http://localhost:8080/HotelReservation-war/"
echo "  Admin Console: http://localhost:4848"
echo "  MySQL:         localhost:3306 (root/root)"
echo ""
echo "View logs: tail -f /opt/glassfish4/glassfish/domains/domain1/logs/server.log"
echo ""

# Keep container running by tailing logs
tail -f /opt/glassfish4/glassfish/domains/domain1/logs/server.log

