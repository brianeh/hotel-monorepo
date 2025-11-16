# Hotel Reservation System - DevContainer Setup Guide

## Overview

This project uses a DevContainer with automated infrastructure setup. The container includes:
- ✅ Java 8 (OpenJDK)
- ✅ Apache Ant 1.10.7
- ✅ GlassFish 4.1.1 Application Server
- ✅ MySQL 8.0
- ✅ All required JAR dependencies
- ✅ Pre-configured JDBC resources

## Initial Setup

### 1. Open in DevContainer

When you open this project in VSCode with DevContainers:

1. **Container Build** (~5 minutes first time):
   - Installs all software (Java, Ant, GlassFish, MySQL)
   - Downloads JAR dependencies
   - Configures build properties

2. **Post-Create Setup** (~2 minutes):
   - Configures MySQL with root password
   - Creates database and schema
   - Starts GlassFish
   - Creates JDBC connection pool and resource

3. **Container is Ready!**

### 2. Verify Setup

Check that services are running:

```bash
# Check GlassFish
asadmin list-domains
# Should show: domain1 running

# Check MySQL
sudo service mysql status
# Should show: mysql is running

# Check JDBC resources
asadmin list-jdbc-resources
# Should show: hotel
```

Access the admin console:
- **GlassFish Admin Console**: http://localhost:4848

## Deploying the Application

### Quick Deploy

```bash
./deploy.sh
```

This script will:
1. ✓ Check that services are running
2. ✓ Clean and build the application
3. ✓ Undeploy existing version (if any)
4. ✓ Deploy the new version
5. ✓ Show access URLs

### Manual Build and Deploy

```bash
# Build
cd /workspaces/hotel-demo-restful
ant clean
ant dist

# Deploy
asadmin deploy --force=true dist/HotelReservation.ear

# Or redeploy
asadmin undeploy HotelReservation
asadmin deploy dist/HotelReservation.ear
```

## Accessing the Application

Once deployed:

- **Application Home**: http://localhost:8080/HotelReservation-war/
- **GlassFish Admin**: http://localhost:4848
- **MySQL**: localhost:3306 (user: root, password: root)

### Application URLs

- Home: http://localhost:8080/HotelReservation-war/Home
- Available Rooms: http://localhost:8080/HotelReservation-war/AvailableRooms
- Reservation: http://localhost:8080/HotelReservation-war/FinalReservation

## Development Workflow

### Typical Development Cycle

1. **Make code changes**
2. **Build and deploy**: `./deploy.sh`
3. **Test in browser**: http://localhost:8080/HotelReservation-war/
4. **Check logs if needed**: `tail -f /opt/glassfish4/glassfish/domains/domain1/logs/server.log`

### Useful Commands

```bash
# Build only
ant dist

# Deploy only (after manual build)
asadmin deploy --force=true dist/HotelReservation.ear

# Redeploy (faster than undeploy + deploy)
asadmin redeploy dist/HotelReservation.ear

# View deployment status
asadmin list-applications

# View logs
tail -f /opt/glassfish4/glassfish/domains/domain1/logs/server.log

# Restart GlassFish
asadmin restart-domain domain1

# Stop/Start GlassFish
asadmin stop-domain domain1
asadmin start-domain domain1
```

## Project Structure

```
hotel-demo-restful/
├── HotelReservation-ejb/          # EJB Module
│   ├── src/
│   │   ├── conf/
│   │   │   └── persistence.xml    # JPA configuration
│   │   └── java/
│   │       ├── models/            # JPA Entities
│   │       └── sessionbeans/      # EJB Facades
│   ├── build.properties           # Build configuration
│   └── build.xml                  # Ant build script
│
├── HotelReservation-war/          # Web Module
│   ├── src/
│   │   └── java/servlets/         # Servlets
│   ├── web/
│   │   ├── views/                 # JSP pages
│   │   ├── css/                   # Stylesheets
│   │   ├── js/                    # JavaScript
│   │   └── WEB-INF/web.xml        # Web configuration
│   ├── build.properties           # Build configuration
│   └── build.xml                  # Ant build script
│
├── database/
│   └── sql_queries.sql            # Database schema
│
├── deploy.sh                       # Quick deploy script
├── build.xml                       # Root build script
└── .devcontainer/                  # DevContainer configuration
    ├── Dockerfile                  # Container image
    └── devcontainer.json           # VS Code settings
```

## Database

### Connection Details

- **Host**: localhost
- **Port**: 3306
- **Database**: hotel_reservation_system
- **User**: root
- **Password**: root

### Tables

- **room**: Room information (id, description, number_of_person, have_private_bathroom, price)
- **reservation**: Reservations (id, id_room, check_in_date, check_out_date, full_name, email, phone, special_request)

### Accessing MySQL

```bash
# Connect to MySQL
mysql -u root -proot

# Use the database
USE hotel_reservation_system;

# View tables
SHOW TABLES;

# Query rooms
SELECT * FROM room;

# Query reservations
SELECT * FROM reservation;
```

### Exporting the Database

Use `database/dump/export_data.sh` to create a mysqldump backup of `hotel_reservation_system`. The script checks that `mysqldump` is available, validates the output directory, and writes to `database/dump/data/mysql_dump.sql`.

```bash
# Default credentials (root/root inside the DevContainer)
./database/dump/export_data.sh

# Override the password if you changed it
MYSQL_PASSWORD=your-secret ./database/dump/export_data.sh
```

The script exits with a non-zero status on failure. Review the output message to confirm the dump succeeded.

## Troubleshooting

### GlassFish Not Running

```bash
asadmin start-domain domain1
```

### MySQL Not Running

```bash
sudo service mysql start
```

### Build Fails

Check that build.properties files exist:
```bash
ls -la HotelReservation-ejb/build.properties
ls -la HotelReservation-war/build.properties
ls -la build.properties
```

If missing, they should be recreated on container restart.

### Deployment Fails

1. Check GlassFish logs:
   ```bash
   tail -50 /opt/glassfish4/glassfish/domains/domain1/logs/server.log
   ```

2. Verify JDBC resource:
   ```bash
   asadmin ping-connection-pool HotelReservationPool
   ```

3. Test database connection:
   ```bash
   mysql -u root -proot hotel_reservation_system -e "SHOW TABLES;"
   ```

### Port Already in Use

If port 8080 or 4848 is in use:
```bash
# Find process using port
sudo lsof -i :8080
sudo lsof -i :4848

# Or stop GlassFish and restart
asadmin stop-domain domain1
asadmin start-domain domain1
```

### View Full Server Log

```bash
# Follow log in real-time
tail -f /opt/glassfish4/glassfish/domains/domain1/logs/server.log

# View last 100 lines
tail -100 /opt/glassfish4/glassfish/domains/domain1/logs/server.log

# Search for errors
grep -i error /opt/glassfish4/glassfish/domains/domain1/logs/server.log
```

## Container Restart

When you restart the container, services will automatically start via `postStartCommand`:
- ✅ MySQL starts automatically
- ✅ GlassFish starts automatically
- ✅ JDBC resources are already configured

You just need to build and deploy your application:
```bash
./deploy.sh
```

## Additional Scripts

### Quick Status Check

```bash
# Check all services status
./status.sh
```

## Technology Stack

- **Java**: OpenJDK 8
- **Build Tool**: Apache Ant 1.10.7
- **Application Server**: GlassFish 4.1.1 (Java EE 7)
- **Database**: MySQL 8.0
- **JPA Provider**: EclipseLink
- **Frontend**: JSP, Bootstrap CSS

## Support

For issues or questions:
1. Check the logs first
2. Review this SETUP.md
3. Consult the project README.md


