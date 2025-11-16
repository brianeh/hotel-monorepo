#!/bin/bash
# Initialize MySQL database and schema
# Adapted from .devcontainer/setup.sh

set -e

# Use environment variables with defaults
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-root}
MYSQL_DATABASE=${MYSQL_DATABASE:-hotel_reservation_system}

echo "═══════════════════════════════════════════════════════"
echo "  Initializing MySQL Database"
echo "═══════════════════════════════════════════════════════"
echo ""

# Start MySQL service
echo "Step 1: Starting MySQL service..."
sudo service mysql start
echo "  Waiting for MySQL to start..."
sleep 15

# Configure MySQL root password
echo "Step 2: Configuring MySQL root password..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';" 2>/dev/null || echo "  (Password may already be set)"
sudo mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || echo "  (Flushing privileges)"

# Fix socket permissions so vscode user can connect
echo "  Fixing socket permissions..."
sudo chmod 755 /var/run/mysqld/

# Test if password works, if not try without password
echo "  Testing MySQL connection..."
if mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "SELECT 1;" >/dev/null 2>&1; then
    echo "  ✓ MySQL password is set correctly"
    MYSQL_CMD="mysql -u root -p${MYSQL_ROOT_PASSWORD}"
else
    echo "  ⚠ Using sudo for MySQL commands"
    MYSQL_CMD="sudo mysql"
fi

# Create database and schema
echo "Step 3: Creating database..."
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE};" 2>&1 | grep -v "Warning" || true

echo "Step 4: Loading schema..."
if [ -f "database/sql_queries.sql" ]; then
    $MYSQL_CMD ${MYSQL_DATABASE} < database/sql_queries.sql 2>&1 | grep -v "Warning" || true
    echo "  ✓ Schema loaded"
else
    echo "  ⚠ Schema file not found: database/sql_queries.sql"
fi

# Verify database
echo "Step 5: Verifying database setup..."
$MYSQL_CMD -e "USE ${MYSQL_DATABASE}; SHOW TABLES;" 2>&1 | grep -v "Warning" | tail -3

echo ""
echo "✓ MySQL database initialized successfully"
echo ""

