#!/bin/bash
# Quick status check for Hotel Reservation System infrastructure

echo "═══════════════════════════════════════════════════════"
echo "  Hotel Reservation System - Status Check"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check MySQL
echo "▶ MySQL Status:"
if sudo service mysql status > /dev/null 2>&1; then
    echo "  ✓ MySQL is running"
    # Try with password first, fall back to sudo if it fails
    if mysql -u root -proot -e "SELECT VERSION();" 2>/dev/null | tail -1 | sed 's/^/    Version: /'; then
        :  # Success with password
    else
        sudo mysql -e "SELECT VERSION();" 2>/dev/null | tail -1 | sed 's/^/    Version: /'
    fi
else
    echo "  ✗ MySQL is not running"
    echo "    Fix: sudo service mysql start"
fi
echo ""

# Check GlassFish
echo "▶ GlassFish Status:"
if asadmin list-domains 2>/dev/null | grep -q "domain1 running"; then
    echo "  ✓ GlassFish domain1 is running"
    asadmin version | grep "GlassFish" | sed 's/^/    /'
else
    echo "  ✗ GlassFish domain1 is not running"
    echo "    Fix: asadmin start-domain domain1"
fi
echo ""

# Check JDBC Resources
echo "▶ JDBC Resources:"
if asadmin list-jdbc-resources 2>/dev/null | grep -q "hotel"; then
    echo "  ✓ JDBC resource 'hotel' exists"
    if asadmin ping-connection-pool HotelReservationPool 2>/dev/null | grep -q "successfully"; then
        echo "  ✓ Connection pool is accessible"
    else
        echo "  ⚠ Connection pool test failed"
    fi
else
    echo "  ✗ JDBC resource 'hotel' not found"
    echo "    Fix: Run container postCreateCommand or create manually"
fi
echo ""

# Check Database
echo "▶ Database Status:"
# Try with password first, fall back to sudo
if mysql -u root -proot -e "USE hotel_reservation_system;" 2>/dev/null; then
    MYSQL_CMD="mysql -u root -proot"
else
    MYSQL_CMD="sudo mysql"
fi

if $MYSQL_CMD -e "USE hotel_reservation_system; SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'hotel_reservation_system';" 2>/dev/null | tail -1 | grep -q "2"; then
    echo "  ✓ Database 'hotel_reservation_system' exists"
    echo "  ✓ Tables created (room, reservation)"
    ROOM_COUNT=$($MYSQL_CMD hotel_reservation_system -e "SELECT COUNT(*) FROM room;" 2>/dev/null | tail -1)
    RESERVATION_COUNT=$($MYSQL_CMD hotel_reservation_system -e "SELECT COUNT(*) FROM reservation;" 2>/dev/null | tail -1)
    echo "    Rooms: $ROOM_COUNT"
    echo "    Reservations: $RESERVATION_COUNT"
else
    echo "  ✗ Database not properly configured"
    echo "    Fix: Run database/sql_queries.sql"
fi
echo ""

# Check Deployed Applications
echo "▶ Deployed Applications:"
if asadmin list-applications 2>/dev/null | grep -q "HotelReservation"; then
    echo "  ✓ HotelReservation is deployed"
    asadmin list-applications --long 2>/dev/null | grep "HotelReservation" | sed 's/^/    /'
else
    echo "  ⚠ HotelReservation not deployed"
    echo "    Deploy: ./deploy.sh"
fi
echo ""

# Check Ports (by testing actual connectivity)
echo "▶ Port Status:"

# Test port 8080 (HTTP)
if timeout 1 bash -c "echo > /dev/tcp/localhost/8080" 2>/dev/null; then
    echo "  ✓ Port 8080 (HTTP) is accessible"
else
    echo "  ⚠ Port 8080 (HTTP) not accessible"
fi

# Test port 4848 (Admin)
if timeout 1 bash -c "echo > /dev/tcp/localhost/4848" 2>/dev/null; then
    echo "  ✓ Port 4848 (Admin) is accessible"
else
    echo "  ⚠ Port 4848 (Admin) not accessible"
fi

# Test port 3306 (MySQL)
if timeout 1 bash -c "echo > /dev/tcp/localhost/3306" 2>/dev/null; then
    echo "  ✓ Port 3306 (MySQL) is accessible"
else
    echo "  ⚠ Port 3306 (MySQL) not accessible"
fi
echo ""

# Check Build Files
echo "▶ Build Configuration:"
if [ -f "HotelReservation-ejb/build.properties" ] && [ -f "HotelReservation-war/build.properties" ] && [ -f "build.properties" ]; then
    echo "  ✓ All build.properties files exist"
else
    echo "  ✗ Some build.properties files are missing"
fi

if [ -f "dist/HotelReservation.ear" ]; then
    echo "  ✓ EAR file exists: dist/HotelReservation.ear"
    ls -lh dist/HotelReservation.ear | awk '{print "    Size: " $5 ", Modified: " $6 " " $7 " " $8}'
else
    echo "  ⚠ EAR file not built yet"
    echo "    Build: ant dist"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════════"
echo "  Access URLs:"
echo "═══════════════════════════════════════════════════════"
if asadmin list-applications 2>/dev/null | grep -q "HotelReservation"; then
    echo "  Application:  http://localhost:8080/HotelReservation-war/"
else
    echo "  Application:  Not deployed yet (run ./deploy.sh)"
fi
echo "  Admin Console: http://localhost:4848"
echo "  MySQL:         localhost:3306 (root/root)"
echo ""


