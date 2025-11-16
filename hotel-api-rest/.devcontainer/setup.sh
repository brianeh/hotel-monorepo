#!/bin/bash
# DevContainer Post-Create Setup Script
# This script configures the development environment after the container is created

set -e

echo "═══════════════════════════════════════════════════════"
echo "  DevContainer Setup - Hotel Reservation System"
echo "═══════════════════════════════════════════════════════"
echo ""

# Step 1: Copy build properties
echo "Step 1: Copying build property files..."
cp /tmp/build-properties/ejb.properties /workspaces/hotel-demo-restful/HotelReservation-ejb/build.properties
cp /tmp/build-properties/war.properties /workspaces/hotel-demo-restful/HotelReservation-war/build.properties
cp /tmp/build-properties/root.properties /workspaces/hotel-demo-restful/build.properties
echo "✓ Build properties configured"
echo ""

# Add service auto-start to bashrc
echo "Step 1b: Configuring auto-start for services..."
if ! grep -q "ensure-services.sh" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Auto-start services for Hotel Reservation System" >> ~/.bashrc
    echo "source /workspaces/hotel-demo-restful/.devcontainer/ensure-services.sh" >> ~/.bashrc
    echo "✓ Auto-start configured"
else
    echo "✓ Auto-start already configured"
fi
echo ""

# Step 2: Configure MySQL
echo "Step 2: Configuring MySQL..."
cp database/sql_queries.sql /tmp/sql_queries.sql

# Start MySQL
sudo service mysql start
echo "  Waiting for MySQL to start..."
sleep 15

# Configure MySQL root password
# MySQL 8.0 uses auth_socket by default, need sudo for first connection
echo "  Setting root password..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';" 2>/dev/null || echo "  (Password may already be set)"
sudo mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || echo "  (Flushing privileges)"

# Fix socket permissions so vscode user can connect
sudo chmod 755 /var/run/mysqld/

# Test if password works, if not try without password
echo "  Testing MySQL connection..."
if mysql -u root -proot -e "SELECT 1;" >/dev/null 2>&1; then
    echo "  ✓ MySQL password is set correctly"
    MYSQL_CMD="mysql -u root -proot"
else
    echo "  ⚠ Using sudo for MySQL commands"
    MYSQL_CMD="sudo mysql"
fi

# Create database and schema
echo "  Creating database..."
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS hotel_reservation_system;" 2>&1 | grep -v "Warning" || true

echo "  Loading schema..."
$MYSQL_CMD hotel_reservation_system < /tmp/sql_queries.sql 2>&1 | grep -v "Warning" || true

# Verify database
echo "  Verifying database setup..."
$MYSQL_CMD -e "USE hotel_reservation_system; SHOW TABLES;" 2>&1 | grep -v "Warning" | tail -3

echo "✓ MySQL configured and database created"
echo ""

# Step 3: Start GlassFish
echo "Step 3: Starting GlassFish..."

# Kill any stale GlassFish processes
echo "  Cleaning up any stale processes..."
pkill -9 -f "glassfish.jar" 2>/dev/null || true
sleep 2

# Clean OSGi cache to prevent corruption issues
echo "  Cleaning OSGi cache..."
rm -rf /opt/glassfish4/glassfish/domains/domain1/osgi-cache/* 2>/dev/null || true

# Start GlassFish
echo "  Starting domain1..."
asadmin start-domain domain1
echo "  Waiting for GlassFish to fully start..."
sleep 10
echo "✓ GlassFish started"
echo ""

# Step 4: Create JDBC resources
echo "Step 4: Creating JDBC resources..."

# Clean up any existing resources
echo "  Cleaning existing resources..."
asadmin delete-jdbc-resource hotel 2>/dev/null || true
asadmin delete-jdbc-connection-pool HotelReservationPool 2>/dev/null || true

# Create connection pool
echo "  Creating JDBC connection pool..."
asadmin create-jdbc-connection-pool \
  --datasourceclassname com.mysql.cj.jdbc.MysqlDataSource \
  --restype javax.sql.DataSource \
  --property user=root:password=root:databaseName=hotel_reservation_system:serverName=localhost:port=3306:useSSL=false:serverTimezone=UTC \
  HotelReservationPool

# Create JNDI resource
echo "  Creating JDBC resource (JNDI: hotel)..."
asadmin create-jdbc-resource \
  --connectionpoolid HotelReservationPool \
  hotel

# Test connection
echo "  Testing JDBC connection pool..."
asadmin ping-connection-pool HotelReservationPool

echo "✓ JDBC resources created and tested"
echo ""

# Final summary
echo "═══════════════════════════════════════════════════════"
echo "  ✓ DevContainer Setup Complete!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Infrastructure Status:"
echo "  ✓ Java 8 (OpenJDK)"
echo "  ✓ Apache Ant 1.10.7"
echo "  ✓ GlassFish 4.1.1 (running)"
echo "  ✓ MySQL 8.0 (running)"
echo "  ✓ Database: hotel_reservation_system"
echo "  ✓ JDBC Resource: hotel"
echo "  ✓ Build properties configured"
echo ""
echo "Next Steps:"
echo "  1. Build and deploy: ./deploy.sh"
echo "  2. Access application: http://localhost:8080/HotelReservation-war/"
echo "  3. Access admin console: http://localhost:4848"
echo ""
echo "Useful Commands:"
echo "  ./status.sh  - Check system status"
echo "  ./deploy.sh  - Build and deploy application"
echo ""


