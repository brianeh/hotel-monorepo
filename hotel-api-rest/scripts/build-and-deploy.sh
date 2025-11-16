#!/bin/bash
# Build and deploy application to GlassFish
# Adapted from deploy.sh

set -e

echo "═══════════════════════════════════════════════════════"
echo "  Building and Deploying Application"
echo "═══════════════════════════════════════════════════════"
echo ""

# Optional: Check if MySQL is running (for verification)
if ! sudo service mysql status > /dev/null 2>&1; then
    echo "⚠ MySQL is not running. Starting MySQL..."
    sudo service mysql start
    sleep 3
fi

# Build the application
echo "Step 1: Building application..."
cd /workspaces/hotel-monorepo/hotel-api-rest

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

# Set JVM option to disable EclipseLink bean validation
echo "Step 2: Setting JVM option to disable EclipseLink bean validation..."
asadmin create-jvm-options "-Declipselink.beanvalidation=false" 2>/dev/null || echo "→ JVM option already set"
echo ""

# Undeploy existing application (if exists)
echo "Step 3: Undeploying existing application..."
asadmin undeploy HotelReservation 2>/dev/null && echo "✓ Previous deployment removed" || echo "→ No previous deployment found"
echo ""

# Deploy the application
echo "Step 4: Deploying application to GlassFish..."
asadmin deploy --force=true dist/HotelReservation.ear

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Deployment successful!"
    echo ""
    
    # Wait for application to be fully deployed
    echo "Step 5: Waiting for application to be fully deployed..."
    sleep 10
    
    # Verify REST API endpoint
    echo "Step 6: Verifying REST API endpoint..."
    if curl -f -s http://localhost:8080/HotelReservation-war/api/rooms > /dev/null 2>&1; then
        echo "  ✓ REST API endpoint is accessible: /api/rooms"
    else
        echo "  ⚠ REST API endpoint verification failed (may need more time to start)"
        echo "  → Endpoint should be available at: http://localhost:8080/HotelReservation-war/api/rooms"
    fi
    echo ""
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Application is ready!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  Web Application:"
    echo "    http://localhost:8080/HotelReservation-war/"
    echo ""
    echo "  REST API Endpoints:"
    echo "    http://localhost:8080/HotelReservation-war/api/rooms"
    echo "    http://localhost:8080/HotelReservation-war/api/reservations"
    echo ""
    echo "  Admin Console:"
    echo "    http://localhost:4848"
    echo ""
else
    echo ""
    echo "✗ Deployment failed!"
    echo "Check logs: tail -50 /opt/glassfish4/glassfish/domains/domain1/logs/server.log"
    exit 1
fi

