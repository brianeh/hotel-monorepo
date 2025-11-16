#!/bin/bash
# Quick deployment script for Hotel Reservation application
# This script builds and deploys the application to GlassFish

set -e

echo "=== Hotel Reservation Build & Deploy ==="
echo ""

# Check if GlassFish is running
if ! asadmin list-domains | grep -q "domain1 running"; then
    echo "⚠ GlassFish is not running. Starting domain1..."
    asadmin start-domain domain1
    sleep 5
fi

# Check if MySQL is running
if ! sudo service mysql status > /dev/null 2>&1; then
    echo "⚠ MySQL is not running. Starting MySQL..."
    sudo service mysql start
    sleep 3
fi

# Build the application
echo "Step 1: Building application..."
cd /workspaces/hotel-monolith

# Set Ant properties for NetBeans-generated build files
ANT_PROPS="-Dlibs.CopyLibs.classpath=/opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar"
ANT_PROPS="$ANT_PROPS -Dj2ee.server.home=/opt/glassfish4/glassfish"
ANT_PROPS="$ANT_PROPS -Dj2ee.server.middleware=/opt/glassfish4"

ant $ANT_PROPS clean
ant $ANT_PROPS dist

if [ ! -f "dist/HotelReservation.ear" ]; then
    echo "✗ Build failed! EAR file not found."
    exit 1
fi

echo "✓ Build successful"
echo ""

# Undeploy existing application (if exists)
echo "Step 2: Undeploying existing application..."
asadmin undeploy HotelReservation 2>/dev/null && echo "✓ Previous deployment removed" || echo "→ No previous deployment found"
echo ""

# Deploy the application
echo "Step 3: Deploying application to GlassFish..."
asadmin deploy --force=true dist/HotelReservation.ear

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Deployment successful!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Application is ready!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  Web Application:"
    echo "    http://localhost:8080/HotelReservation-war/"
    echo ""
    echo "  Admin Console:"
    echo "    http://localhost:4848"
    echo ""
    echo "  View logs:"
    echo "    tail -f /opt/glassfish4/glassfish/domains/domain1/logs/server.log"
    echo ""
else
    echo ""
    echo "✗ Deployment failed!"
    echo "Check logs: tail -50 /opt/glassfish4/glassfish/domains/domain1/logs/server.log"
    exit 1
fi


