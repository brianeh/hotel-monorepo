# Hotel Demo - PostgreSQL Database

Standalone PostgreSQL database service for the Hotel Reservation System. This database is shared across multiple phases of the modernization portfolio (Phases 3.5, 4, 5, and 6).

## Overview

This project provides a containerized PostgreSQL 15 database that can run independently and be accessed by multiple applications. It demonstrates:

- **Service Decoupling**: Database as a separate, reusable service
- **Realistic Architecture**: Similar to using AWS RDS in production
- **Multi-Phase Support**: One database, multiple consuming applications
- **Modern PostgreSQL**: Using PostgreSQL 15 with Alpine Linux

## Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0 or higher

### Start the Database

**Option 1: From the project directory (standalone)**

```bash
# Navigate to the project
cd hotel-db-postgres

# Start PostgreSQL
docker compose up -d

# Verify it's running
docker compose ps
```

**Option 2: From the monorepo root (integrated)**

```bash
# From the monorepo root directory
# Start only the database service
docker compose up -d hotel-db-postgres

# Or start with other services
docker compose up -d
```

The database will be available at `localhost:5432`.

### Stop the Database

**Option 1: From the project directory**

```bash
# Stop the database (data persists)
docker compose down

# Stop and remove data volume (clean slate)
docker compose down -v
```

**Option 2: From the monorepo root**

```bash
# Stop only the database service
docker compose stop hotel-db-postgres

# Stop and remove the database service
docker compose down hotel-db-postgres

# Stop all services
docker compose down
```

**Note:** Use Option 1 when working only with the database service. Use Option 2 when managing multiple services together from the monorepo root. Both approaches use the same Docker network and volumes, so they are compatible.

## Connection Details

| Parameter | Value |
|-----------|-------|
| **Host** | `localhost` (from host) or `hotel-postgres-standalone` (from Docker network) |
| **Port** | `5432` |
| **Database** | `hotel_reservation` |
| **Username** | `postgres` |
| **Password** | `postgres` |

### Connect from Command Line

```bash
# Using psql
docker exec -it hotel-postgres-standalone psql -U postgres -d hotel_reservation

# Or from your host (if you have psql installed)
psql -h localhost -U postgres -d hotel_reservation
```

### Connect from Application

```bash
# Connection string format
postgresql://postgres:postgres@localhost:5432/hotel_reservation

# JDBC URL (for Java applications)
jdbc:postgresql://localhost:5432/hotel_reservation

# From another Docker container on hotel-shared-network
postgresql://postgres:postgres@hotel-postgres-standalone:5432/hotel_reservation
```

## Database Schema

The database includes two tables, a view, and various indexes and constraints:

### `room` Table
- **id** (SERIAL): Primary key
- **description** (TEXT): Room description
- **number_of_person** (INTEGER): Guest capacity
- **has_private_bathroom** (BOOLEAN): Private bathroom flag
- **price** (NUMERIC(10,2)): Nightly rate in USD

**Indexes:**
- `idx_room_capacity` on `number_of_person`
- `idx_room_price` on `price`
- `idx_room_bathroom` on `has_private_bathroom`

**Comments:** Table and columns include descriptive comments for documentation.

### `reservation` Table
- **id** (SERIAL): Primary key
- **id_room** (INTEGER, NOT NULL): Foreign key to room
- **check_in_date** (DATE): Check-in date
- **check_out_date** (DATE): Check-out date
- **full_name** (VARCHAR(25)): Guest name
- **email** (VARCHAR(25)): Guest email
- **phone** (VARCHAR(20)): Guest phone
- **special_request** (TEXT): Special requests

**Foreign Key Constraint:**
- `fk_reservation_room`: References `room(id)` with `ON DELETE RESTRICT` and `ON UPDATE CASCADE`

**Indexes:**
- `idx_reservation_dates` on `(check_in_date, check_out_date)` (composite)
- `idx_reservation_room` on `id_room`
- `idx_reservation_email` on `email`
- `idx_reservation_checkin` on `check_in_date`

**Comments:** Table and columns include descriptive comments for documentation.

### `available_rooms_today` View
A PostgreSQL view that shows rooms available for booking today (not currently reserved):

```sql
SELECT r.*
FROM room r
WHERE r.id NOT IN (
    SELECT res.id_room
    FROM reservation res
    WHERE CURRENT_DATE BETWEEN res.check_in_date AND res.check_out_date
);
```

This view automatically filters out rooms that have active reservations covering today's date.

## Sample Data

The database is pre-populated with:
- **10 rooms** (various types: single, double, suite, family, etc.)
- **8 reservations** (sample bookings for testing)

## Project Structure

```
hotel-db-postgres/
├── docker-compose.yml          # PostgreSQL service definition
├── schema/
│   ├── V1__create_schema.sql   # Database schema
│   └── V2__seed_data.sql       # Sample data
├── backups/                    # Backup location (empty initially)
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## Schema Initialization

The database schema is automatically initialized on first startup:

1. **Initialization Process:**
   - PostgreSQL's `docker-entrypoint-initdb.d` directory is mounted from `./schema`
   - Scripts in this directory run in **alphabetical order** on first database initialization only
   - The `V1__` and `V2__` prefixes ensure correct execution order (schema before data)

2. **Schema Files:**
   - `V1__create_schema.sql`: Creates tables, indexes, constraints, views, and comments
   - `V2__seed_data.sql`: Inserts sample rooms and reservations

3. **Re-initialization:**
   - Schema scripts only run when the data volume is empty
   - To reinitialize: remove the volume (`docker compose down -v`) and restart

## Usage Scenarios

### Scenario 1: Phase 3.5 - Database Migration
```bash
# Start PostgreSQL (from monorepo root)
docker compose up -d hotel-db-postgres

# Or from project directory
cd hotel-db-postgres
docker compose up -d

# Run migration (in hotel-api-rest or hotel-monolith)
cd ../hotel-api-rest
code .  # Opens DevContainer
# Migration scripts connect to PostgreSQL
```

### Scenario 2: Phase 4 - REST API Development
```bash
# PostgreSQL already running from Phase 3.5
# REST API (hotel-api-rest) connects via JDBC:
#   jdbc:postgresql://localhost:5432/hotel_reservation
# Or from Docker network:
#   jdbc:postgresql://hotel-postgres-standalone:5432/hotel_reservation
```

### Scenario 3: Development Across Phases
```bash
# One database, multiple phases use it simultaneously
# Phase 3.5: GlassFish (hotel-monolith) → PostgreSQL
# Phase 4: REST API (hotel-api-rest) → PostgreSQL
# Phase 6: Microservices → PostgreSQL
```

## Docker Network

This database uses the `hotel-shared-network` Docker network, allowing other containers to connect using the service name:

```yaml
# Other services can connect via:
networks:
  - hotel-shared-network

# Access database at: hotel-postgres-standalone:5432
```

## Database Operations

### View Logs

```bash
# From project directory
docker compose logs -f postgres

# From monorepo root
docker compose logs -f hotel-db-postgres
```

### Check Database Size

```bash
docker exec -it hotel-postgres-standalone psql -U postgres -d hotel_reservation -c "
  SELECT pg_size_pretty(pg_database_size('hotel_reservation')) as database_size;
"
```

### Backup Database

```bash
# Create backup (saves to ./backups directory, mounted in container)
docker exec -it hotel-postgres-standalone pg_dump -U postgres hotel_reservation > backups/backup_$(date +%Y%m%d).sql

# Or create backup directly in container's /backups mount
docker exec -it hotel-postgres-standalone pg_dump -U postgres -Fc hotel_reservation > backups/backup_$(date +%Y%m%d).dump

# Restore from SQL backup
docker exec -i hotel-postgres-standalone psql -U postgres hotel_reservation < backups/backup_YYYYMMDD.sql

# Restore from custom format backup
docker exec -i hotel-postgres-standalone pg_restore -U postgres -d hotel_reservation backups/backup_YYYYMMDD.dump
```

**Note:** The `backups/` directory is mounted into the container at `/backups`, so backups created inside the container are accessible from the host.

### Reset Database

```bash
# Stop containers (from project directory)
docker compose down

# Or from monorepo root
docker compose stop hotel-db-postgres

# Remove data volume (this deletes all data)
docker volume rm hotel-postgres-data

# Restart (will reinitialize with schema scripts from ./schema directory)
# From project directory:
docker compose up -d

# Or from monorepo root:
docker compose up -d hotel-db-postgres
```

**Note:** Removing the volume permanently deletes all data. The schema will be recreated from the `./schema` directory scripts on the next startup.

## Health Check

The database includes a health check that runs every 10 seconds:

```bash
# Check health status
docker inspect hotel-postgres-standalone --format='{{.State.Health.Status}}'
```

## Performance Tuning

The default configuration includes development-friendly settings:

- **shared_buffers**: 256MB
- **max_connections**: 200
- **log_statement**: all (logs all SQL statements)

For production, adjust these in `docker-compose.yml`.

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 5432
lsof -i :5432

# Stop conflicting service or change port in docker-compose.yml (project) or root docker-compose.yml
```

### Cannot Connect

```bash
# Verify container is running
docker ps | grep hotel-postgres

# Check logs for errors (from project directory)
docker compose logs postgres

# Or from monorepo root
docker compose logs hotel-db-postgres

# Test connection
docker exec -it hotel-postgres-standalone psql -U postgres -c "SELECT 1;"
```

### Data Not Persisting

```bash
# Verify volume exists
docker volume ls | grep hotel-postgres-data

# Check volume mount
docker inspect hotel-postgres-standalone | grep -A 10 Mounts
```

## Integration with Other Projects

### Phase 3.5 (hotel-monolith)
- Legacy GlassFish application connects to this database
- Migration tools can connect to PostgreSQL
- Uses same schema and data

### Phase 4 (hotel-api-rest)
- REST API application connects directly
- Uses same schema and data
- Can run alongside monolith for comparison

### Phase 5 (Future: Serverless)
- Could use for hybrid deployment
- Or migrate data to DynamoDB

### Phase 6 (Future: Microservices)
- Shared database for multiple services
- Or partitioned by bounded context

## Environment Variables

The `docker-compose.yml` file currently uses hardcoded environment values for simplicity. An `.env.example` file is provided as a reference template showing all available configuration options.

**Current Configuration:**
- Database credentials, port, and container settings are defined directly in `docker-compose.yml`
- The `.env.example` file documents all possible configuration variables

**To use environment variables:**
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` with your desired values
3. Update `docker-compose.yml` to reference variables using `${VARIABLE_NAME:-default_value}` syntax

**Note:** The current setup uses hardcoded values for development simplicity. For production deployments, consider using environment variables for sensitive credentials.

## Contributing

This database service is part of the Hotel Reservation System modernization portfolio. See the main portfolio [README](https://github.com/brianeh/hotel-monorepo/blob/main/README.md) for the overall architecture and migration strategy.

## Related Documentation

- [Migration Guide](../docs/DATABASE_MIGRATION_GUIDE.md) - How to migrate from MySQL
- [Architecture Comparison](../docs/ARCHITECTURE_COMPARISON.md) - Overall system design
- [Modernization Roadmap](../docs/MODERNIZATION_ROADMAP.md) - Phase-by-phase plan

## License

MIT License - See LICENSE file in the repository root

