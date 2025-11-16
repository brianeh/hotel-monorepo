# Hotel Reservation System - Quick Start

## First Time Setup

1. **Open in DevContainer** (wait ~7 minutes for setup)
2. **Verify setup**: `./status.sh`
3. **Deploy application**: `./deploy.sh`
4. **Open browser**: http://localhost:8080/HotelReservation-war/

That's it! 🎉

## Daily Development

```bash
# Make code changes...

# Build and deploy
./deploy.sh

# Test in browser
# http://localhost:8080/HotelReservation-war/
```

## Essential Commands

```bash
# Quick status check
./status.sh

# Build and deploy
./deploy.sh

# Export database dump (writes to database/dump/data/mysql_dump.sql)
./database/dump/export_data.sh

# Build only
ant dist

# Deploy only
asadmin deploy --force=true dist/HotelReservation.ear

# View logs
tail -f /opt/glassfish4/glassfish/domains/domain1/logs/server.log

# Restart GlassFish
asadmin restart-domain domain1
```

Need a different password? Prefix the command with `MYSQL_PASSWORD=...` before running the export script.

## Access URLs

- **Application**: http://localhost:8080/HotelReservation-war/
- **Admin Console**: http://localhost:4848
- **MySQL**: localhost:3306 (user: root, password: root)

## Troubleshooting

### Services not running?
```bash
# Start MySQL
sudo service mysql start

# Start GlassFish
asadmin start-domain domain1
```

### Application not working?
```bash
# Check status
./status.sh

# View logs
tail -50 /opt/glassfish4/glassfish/domains/domain1/logs/server.log

# Redeploy
./deploy.sh
```

### Database issues?
```bash
# Connect to MySQL
mysql -u root -proot

# Check database
USE hotel_reservation_system;
SHOW TABLES;
SELECT * FROM room;
```

## Project Structure

```
hotel-demo-restful/
├── deploy.sh              # ← Build & deploy script
├── status.sh              # ← Status check
├── HotelReservation-ejb/  # ← Backend (EJB)
├── HotelReservation-war/  # ← Frontend (Web)
└── database/              # ← SQL schema
```

## Development Workflow

1. Edit code
2. Run `./deploy.sh`
3. Refresh browser
4. Check logs if needed

For more details, see **SETUP.md**


