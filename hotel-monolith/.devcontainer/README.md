# DevContainer Configuration

## Overview
This devcontainer is configured with all the necessary tools and services for the Hotel Reservation System:

- **Java 8** (OpenJDK 1.8.0)
- **Apache Ant 1.10.7**
- **GlassFish 4.1.1** Application Server
- **MySQL 8.0** Database
- **GitHub CLI**

## Setup

### Initial Setup
The container automatically runs `setup.sh` on first creation, which:
1. Configures build properties for all modules
2. Sets up MySQL with root password
3. Creates the database and schema
4. Starts GlassFish
5. Configures JDBC resources

### Automatic Service Startup
Services are automatically started when you open a terminal via `ensure-services.sh` (configured in `~/.bashrc`):
1. Checks and starts MySQL if needed
2. Checks and starts GlassFish if needed
3. Runs once per terminal session

## MySQL Configuration

MySQL is automatically configured during container setup with:
- **Root password:** `root`
- **Socket permissions:** Fixed for vscode user access
- **Database:** `hotel_reservation_system` created with schema

If you need to manually reconfigure MySQL:
```bash
# Connect as root using sudo
sudo mysql

# Set the password
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
FLUSH PRIVILEGES;
exit

# Fix socket permissions
sudo chmod 755 /var/run/mysqld/

# Test the connection
mysql -u root -proot -e "SELECT VERSION();"
```

## Default Credentials

### MySQL
- **Username:** `root`
- **Password:** `root`
- **Database:** `hotel_reservation_system`
- **Port:** 3306

### GlassFish Admin Console
- **URL:** http://localhost:4848
- **Username:** `admin`
- **Password:** (no password by default)

## Useful Commands

### Status Check
```bash
./status.sh
```
Shows the status of all services, database, and deployed applications.

### Deploy Application
```bash
./deploy.sh
```
Builds and deploys the application to GlassFish.

### MySQL Commands
```bash
# Connect to MySQL
mysql -u root -proot

# Connect to the application database
mysql -u root -proot hotel_reservation_system

# Run a query
mysql -u root -proot hotel_reservation_system -e "SELECT * FROM room;"
```

### GlassFish Commands
```bash
# Start domain
asadmin start-domain domain1

# Stop domain
asadmin stop-domain domain1

# List applications
asadmin list-applications

# Undeploy application
asadmin undeploy HotelReservation

# View logs
tail -f $GLASSFISH_HOME/glassfish/domains/domain1/logs/server.log
```

## Troubleshooting

### MySQL Won't Start
```bash
# Check MySQL status
sudo service mysql status

# Start MySQL
sudo service mysql start

# Check logs
sudo tail -f /var/log/mysql/error.log
```

### GlassFish Won't Start
```bash
# Check if domain is running
asadmin list-domains

# Start domain
asadmin start-domain domain1

# Check logs
tail -f $GLASSFISH_HOME/glassfish/domains/domain1/logs/server.log
```

### JDBC Connection Pool Fails
```bash
# Test connection pool
asadmin ping-connection-pool HotelReservationPool

# Recreate JDBC resources (this is done in setup.sh)
asadmin delete-jdbc-resource hotel 2>/dev/null || true
asadmin delete-jdbc-connection-pool HotelReservationPool 2>/dev/null || true

asadmin create-jdbc-connection-pool \
  --datasourceclassname com.mysql.cj.jdbc.MysqlDataSource \
  --restype javax.sql.DataSource \
  --property user=root:password=root:databaseName=hotel_reservation_system:serverName=localhost:port=3306 \
  HotelReservationPool

asadmin create-jdbc-resource \
  --connectionpoolid HotelReservationPool \
  hotel
```

## Environment Variables

The following environment variables are automatically set:

- `JAVA_HOME=/usr/lib/jvm/java-8-openjdk-arm64`
- `GLASSFISH_HOME=/opt/glassfish4`
- `ANT_HOME=/opt/apache-ant-1.10.7`
- `PATH` includes all necessary binaries

## File Structure

```
.devcontainer/
├── Dockerfile              # Container image definition
├── devcontainer.json       # VS Code/Cursor configuration
├── setup.sh               # Post-create setup script
├── ensure-services.sh     # Auto-start services (runs from bashrc)
└── README.md              # This file
```

## Ports

The following ports are forwarded:

- **8080** - GlassFish HTTP (Application)
- **4848** - GlassFish Admin Console
- **3306** - MySQL Database

## Access URLs

- **Application:** http://localhost:8080/HotelReservation-war/
- **Admin Console:** http://localhost:4848
- **MySQL:** localhost:3306

## Notes

- The container user is `vscode` with sudo privileges
- Services auto-start when you open a terminal (via `ensure-services.sh` in bashrc)
- Build properties are automatically configured during container creation
- JDBC resources are pre-configured with the JNDI name "hotel"
- OSGi cache is cleaned during setup to prevent GlassFish startup issues
