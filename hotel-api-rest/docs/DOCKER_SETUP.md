# Hotel API REST - Docker Compose Setup Guide

## Overview

This document describes how to run the hotel-api-rest application using Docker Compose. The setup uses a single container that runs both MySQL server and GlassFish application server, matching the existing DevContainer architecture. This service provides REST API endpoints in addition to the web application interface.

## Architecture

- **Single Container**: Both MySQL and GlassFish run in the same container
- **MySQL Server**: Runs as a system service within the container
- **GlassFish 4.1.1**: Application server hosting the Java EE application with REST API support
- **Jackson JAXB Module**: Installed in GlassFish for JSON serialization/deserialization
- **Data Persistence**: Volumes for MySQL data and GlassFish domain data

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB of available disk space
- Ports 8080, 4850, and 3308 available on the host

Note: Commands use Docker Compose V2 (`docker compose`). If you’re on legacy Compose V1, substitute `docker-compose`.

## Quick Start

1. **Start the service**:
   ```bash
   docker compose up hotel-api-rest
   ```

2. **Start in detached mode**:
   ```bash
   docker compose up -d hotel-api-rest
   ```

3. **View logs**:
   ```bash
   docker compose logs -f hotel-api-rest
   ```

4. **Stop the service**:
   ```bash
   docker compose stop hotel-api-rest
   ```

5. **Stop and remove containers**:
   ```bash
   docker compose down
   ```

## Access URLs

Once the container is running, you can access:

- **Web Application**: http://localhost:8080/HotelReservation-war/
- **REST API Endpoints**:
  - **Rooms**: http://localhost:8080/HotelReservation-war/api/rooms
  - **Reservations**: http://localhost:8080/HotelReservation-war/api/reservations
- **GlassFish Admin Console**: http://localhost:4850
- **MySQL Database**: `localhost:3308` (user: `root`, password: `root`)

## REST API Testing

### Using curl

**Get all rooms**:
```bash
curl http://localhost:8080/HotelReservation-war/api/rooms
```

**Get all reservations**:
```bash
curl http://localhost:8080/HotelReservation-war/api/reservations
```

**Get a specific room**:
```bash
curl http://localhost:8080/HotelReservation-war/api/rooms/1
```

**Create a reservation**:
```bash
curl -X POST http://localhost:8080/HotelReservation-war/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "idRoom": 1,
    "checkInDate": "2024-06-01",
    "checkOutDate": "2024-06-05",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "555-1234",
    "specialRequest": "Late checkout requested"
  }'
```

### Using the test page

Navigate to: http://localhost:8080/HotelReservation-war/rest-test.html

This page provides an interactive interface to test all REST API endpoints.

## Environment Variables

### Container Environment Variables

The following environment variables can be configured in `docker-compose.yml`:

| Variable | Default | Description |
|----------|---------|-------------|
| `JAVA_HOME` | `/usr/lib/jvm/java-8-openjdk-arm64` | Java installation path |
| `GLASSFISH_HOME` | `/opt/glassfish4` | GlassFish installation path |
| `ANT_HOME` | `/opt/apache-ant-1.10.7` | Apache Ant installation path |
| `MYSQL_ROOT_PASSWORD` | `root` | MySQL root password |
| `MYSQL_DATABASE` | `hotel_reservation_system` | Database name |

### Host Path Configuration

**`MONOREPO_HOST_PATH`**: Path to the `hotel-api-rest` directory on the host filesystem.

This variable is used for the volume mount and allows Docker Compose to work from both Mac host terminal and devcontainer environments.

#### Using from Mac Host Terminal

When running `docker compose` from your Mac terminal, you can use the default relative path:

```bash
# Default behavior - no configuration needed
docker compose up -d hotel-api-rest
```

Or create a `.env` file in the monorepo root:

```env
# .env file (optional when running from Mac host)
MONOREPO_HOST_PATH=./hotel-api-rest
```

#### Using from DevContainer

When running `docker compose` from inside a devcontainer, you need to set the absolute Mac host path:

**Option 1: Using .env file** (Recommended)

Create a `.env` file in the monorepo root:

```env
# .env file in monorepo root
MONOREPO_HOST_PATH=/Users/username/path/to/hotel-monorepo/hotel-api-rest
```

Replace `/Users/username/path/to/hotel-monorepo` with your actual Mac path.

**Option 2: Using environment variable**

Export the variable in your devcontainer shell:

```bash
export MONOREPO_HOST_PATH=/Users/username/path/to/hotel-monorepo/hotel-api-rest
docker compose up -d hotel-api-rest
```

**Finding your Mac host path:**

1. **From VS Code**: Check the workspace folder path shown in the Explorer
2. **From Mac Terminal**: Navigate to your monorepo and run `pwd`
3. **From devcontainer**: Inspect the devcontainer mount:
   ```bash
   docker inspect $(docker ps --filter "name=.*devcontainer.*" --format "{{.Names}}" | head -1) | grep -A 10 Mounts
   ```

**Example:**

If your monorepo is at `/Users/john/projects/hotel-monorepo` on your Mac, then:

```env
MONOREPO_HOST_PATH=/Users/john/projects/hotel-monorepo/hotel-api-rest
```

**Note**: The `.env` file is automatically loaded by Docker Compose when placed in the same directory as `docker-compose.yml`. See `.env.example` for a template.

## Volumes

The following volumes are created for data persistence:

- **`hotel-api-rest-glassfish-data`**: GlassFish domain data and deployed applications
- **`hotel-api-rest-mysql-data`**: MySQL database files

Data in these volumes persists across container restarts and removals.

### Managing Volumes

**List volumes**:
```bash
docker volume ls | grep hotel-api-rest
```

**Inspect a volume**:
```bash
docker volume inspect hotel-api-rest-mysql-data
```

**Remove volumes** (⚠️ This will delete all data):
```bash
docker compose down -v
```

## Container Startup Process

The container follows this startup sequence:

1. **Copy build properties** to project directories
2. **Start MySQL service** and wait for readiness
3. **Initialize database** (create database and load schema)
4. **Clean OSGi cache** to prevent corruption
5. **Start GlassFish domain**
6. **Configure JDBC resources** (connection pool and JNDI resource)
7. **Build and deploy application** to GlassFish
8. **Verify REST API endpoint** (test `/api/rooms` endpoint)
9. **Keep container running** (tail GlassFish logs)

## Jackson JAXB Module

The Dockerfile installs `jackson-module-jaxb-annotations-2.5.1.jar` into GlassFish's modules directory. This module is required for proper JSON serialization/deserialization of JPA entities that use JAXB annotations (such as `@XmlRootElement`).

The module is installed at: `/opt/glassfish4/glassfish/modules/jackson-module-jaxb-annotations-2.5.1.jar`

This enables:
- JSON serialization of Room and Reservation entities
- Processing of existing `@XmlRootElement` annotations
- Compatibility with the JAX-RS REST API endpoints

## Troubleshooting

### Container fails to start

**Check logs**:
```bash
docker compose logs hotel-api-rest
```

**Common issues**:
- Port conflicts: Ensure ports 8080, 4850, and 3308 are not in use
- Insufficient resources: Ensure Docker has enough memory allocated
- Build failures: Check that all dependencies are available

### MySQL connection issues

**Test MySQL connection from host**:
```bash
mysql -h localhost -P 3308 -u root -proot
```

**Check MySQL status in container**:
```bash
docker compose exec hotel-api-rest sudo service mysql status
```

**Restart MySQL in container**:
```bash
docker compose exec hotel-api-rest sudo service mysql restart
```

### GlassFish issues

**Check GlassFish status**:
```bash
docker compose exec hotel-api-rest asadmin list-domains
```

**View GlassFish logs**:
```bash
docker compose exec hotel-api-rest tail -f /opt/glassfish4/glassfish/domains/domain1/logs/server.log
```

**Restart GlassFish**:
```bash
docker compose exec hotel-api-rest asadmin restart-domain domain1
```

### REST API endpoints not accessible

**Verify endpoint is deployed**:
```bash
docker compose exec hotel-api-rest curl -f http://localhost:8080/HotelReservation-war/api/rooms
```

**Check application deployment**:
```bash
docker compose exec hotel-api-rest asadmin list-applications
```

**Verify Jackson module is installed**:
```bash
docker compose exec hotel-api-rest ls -la /opt/glassfish4/glassfish/modules/jackson-module-jaxb-annotations-2.5.1.jar
```

**Common REST API issues**:
- Application not fully deployed: Wait a few seconds after container startup
- Jackson module not found: Rebuild the Docker image
- Database connection issues: Check JDBC resource configuration

### Application not deploying

**Check build output**:
```bash
docker compose logs hotel-api-rest | grep -i "build\|deploy"
```

**Manually trigger build and deploy**:
```bash
docker compose exec hotel-api-rest bash scripts/build-and-deploy.sh
```

### Database schema not loading

**Check database initialization**:
```bash
docker compose logs hotel-api-rest | grep -i "database\|schema"
```

**Manually initialize database**:
```bash
docker compose exec hotel-api-rest bash scripts/init-database.sh
```

**Verify database tables**:
```bash
docker compose exec hotel-api-rest mysql -u root -proot hotel_reservation_system -e "SHOW TABLES;"
```

### Volume mount issues (especially in devcontainer)

**Error**: `mounts denied: The path ... is not shared from the host`

This occurs when running `docker compose` from inside a devcontainer. The issue is that Docker needs the actual Mac host filesystem path, not the devcontainer path.

**Solution**:

1. **Find your Mac host path** (see methods above in "Host Path Configuration" section)

2. **Create `.env` file** in monorepo root with the absolute Mac path:
   ```env
   MONOREPO_HOST_PATH=/Users/username/path/to/hotel-monorepo/hotel-api-rest
   ```

3. **Or export the variable** before running Docker Compose:
   ```bash
   export MONOREPO_HOST_PATH=/Users/username/path/to/hotel-monorepo/hotel-api-rest
   docker compose up -d hotel-api-rest
   ```

4. **Verify Docker Desktop File Sharing**: Ensure the parent directory is shared:
   - Open Docker Desktop → Settings → Resources → File Sharing
   - Add `/Users` or the specific parent directory if not already shared

**Alternative**: Run `docker compose` commands from Mac host terminal instead of devcontainer.

## Rebuilding the Container

If you make changes to the Dockerfile or need to rebuild:

```bash
docker compose build hotel-api-rest
docker compose up -d hotel-api-rest
```

Or force a rebuild without cache:

```bash
docker compose build --no-cache hotel-api-rest
```

## Development Workflow

### Making code changes

1. Edit source files in `hotel-api-rest/` directory
2. Rebuild and redeploy:
   ```bash
   docker compose exec hotel-api-rest bash scripts/build-and-deploy.sh
   ```
3. Test REST API endpoints or refresh browser to see changes

### Testing REST API changes

After making changes to REST resources:

1. Rebuild and redeploy (see above)
2. Test the endpoint:
  ```bash
  curl http://localhost:8080/HotelReservation-war/api/rooms
  ```
3. Check GlassFish logs for any errors:
   ```bash
   docker-compose logs hotel-api-rest | tail -50
   ```

### Viewing application logs

```bash
# Follow logs in real-time
docker compose logs -f hotel-api-rest

# View last 100 lines
docker compose logs --tail=100 hotel-api-rest
```

### Accessing container shell

```bash
docker compose exec hotel-api-rest bash
```

## Health Check

The container includes a health check that verifies the REST API endpoint is accessible:

- **Test**: HTTP GET to `http://localhost:8080/HotelReservation-war/api/rooms`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start period**: 60 seconds (allows time for initial startup)

Check health status:
```bash
docker compose ps hotel-api-rest
```

## Cleanup

**Stop and remove containers** (keeps volumes):
```bash
docker compose down
```

**Stop and remove containers and volumes** (⚠️ deletes all data):
```bash
docker compose down -v
```

**Remove images**:
```bash
docker rmi $(docker images | grep hotel-api-rest | awk '{print $3}')
```

## Differences from hotel-monolith

This service is similar to `hotel-monolith` but includes:

1. **REST API endpoints** at `/api/*` paths
2. **Jackson JAXB module** installed in GlassFish for JSON support
3. **REST API healthcheck** that verifies API endpoint accessibility
4. **Different port mappings**: 8082 (vs 8080), 4850 (vs 4849), 3308 (vs 3307)

Both services can run simultaneously without port conflicts.

## Integration with hotel-ui-react

This service is designed to be consumed by the `hotel-ui-react` frontend (Phase 3). The REST API endpoints are accessible on port 8080 and can be used by the React application.

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GlassFish Documentation](https://glassfish.org/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JAX-RS Documentation](https://jax-rs.github.io/)
- [Jackson JAXB Annotations Module](https://github.com/FasterXML/jackson-modules-jaxb)

## Support

For issues specific to this setup, check:
- Container logs: `docker compose logs hotel-api-rest`
- GlassFish logs: `/opt/glassfish4/glassfish/domains/domain1/logs/server.log`
- MySQL logs: Check system logs in container
- REST API endpoint: http://localhost:8080/HotelReservation-war/api/rooms
- Volume mount issues: See troubleshooting section above

