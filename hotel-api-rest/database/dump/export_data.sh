#!/bin/bash

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration
DB_NAME="hotel_reservation_system"
DB_USER="root"
DB_PASS="${MYSQL_PASSWORD:-root}"  # Use env var or default
OUTPUT_DIR="data"
OUTPUT_FILE="${OUTPUT_DIR}/mysql_dump.sql"

# Validate directory exists
if [ ! -d "$OUTPUT_DIR" ]; then
    echo "Error: Directory $OUTPUT_DIR does not exist"
    exit 1
fi

# Check if mysqldump is available
if ! command -v mysqldump &> /dev/null; then
    echo "Error: mysqldump command not found"
    exit 1
fi

echo "Starting database export..."

# Export database
# --databases - Include CREATE DATABASE statement
# --add-drop-database - Add DROP DATABASE before CREATE
# --add-drop-table - Add DROP TABLE before CREATE TABLE
# --complete-insert - Use complete INSERT statements (with column names)
# --routines - Include stored procedures and functions
# --triggers - Include triggers
# --hex-blob - Dump binary data in hexadecimal format
# --default-character-set=utf8mb4 - Ensure proper character encoding

mysqldump -u "$DB_USER" -p"$DB_PASS" \
  --databases "$DB_NAME" \
  --add-drop-database \
  --add-drop-table \
  --complete-insert \
  --routines \
  --triggers \
  --hex-blob \
  --default-character-set=utf8mb4 \
  > "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Export completed successfully: $OUTPUT_FILE"
    ls -lh "$OUTPUT_FILE"
else
    echo "✗ Export failed"
    exit 1
fi
