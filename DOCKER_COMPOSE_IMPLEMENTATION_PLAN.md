# Docker Compose Implementation Plan

This document outlines the phased implementation plan for creating a root-level `docker-compose.yml` file that orchestrates all services in the monorepo. Each phase can be implemented independently and executed sequentially.

## Overview

The monorepo contains four main services that need to be containerized and orchestrated:

1. **hotel-monolith** - Legacy Java EE application (GlassFish + MySQL)
2. **hotel-api-rest** - Modernized Java EE application with REST API (GlassFish + MySQL)
3. **hotel-ui-react** - React SPA frontend (Vite dev server)
4. **hotel-db-postgres** - PostgreSQL database for future migrations

---

## Phase 1: hotel-monolith Service

### Objective
Containerize and orchestrate the legacy 3-tier Java EE application (Servlet/EJB on GlassFish with MySQL).

### Service Architecture
- **Application Server**: GlassFish 4.1.1
- **Database**: MySQL 8.0
- **Build Tool**: Apache Ant
- **Java Version**: OpenJDK 8

### Implementation Tasks

#### 1.1 Create Dockerfile for hotel-monolith
**Location**: `/workspaces/hotel-monorepo/hotel-monolith/Dockerfile`

**Requirements**:
- Base on existing `.devcontainer/Dockerfile` structure
- Install: Java 8, Ant 1.10.7, GlassFish 4.1.1, MySQL server (both MySQL and GlassFish run in same container)
- Download required JAR dependencies (MySQL connector, JSTL, Commons Codec)
- Configure GlassFish with MySQL driver
- Set up build properties
- Note: Startup logic will use adapted existing scripts (see section 1.3)

**Key Configuration**:
- MySQL connection: `localhost:3306` (MySQL runs as service in same container)
- Database: `hotel_reservation_system`
- Credentials: `root:root` (configurable via environment variables)
- GlassFish ports: `8080` (HTTP), `4848` (Admin)
- MySQL port: `3306` (exposed for optional host access)
- JDBC Pool: `HotelReservationPool`
- JDBC Resource JNDI: `hotel`

**Rationale**: Single-container approach matches existing DevContainer setup, simplifies architecture, and requires minimal script changes.

#### 1.2 Create Single Container Service
**Service Name**: `hotel-monolith`

**Configuration**:
- Build from: `hotel-monolith/Dockerfile`
- Working directory: `/workspaces/hotel-monorepo/hotel-monolith`
- Ports:
  - `8080:8080` (HTTP)
  - `4849:4848` (Admin - mapped to 4849)
  - `3307:3306` (MySQL - mapped to 3307 to avoid conflict with host MySQL if present)
- Environment variables:
  - `JAVA_HOME=/usr/lib/jvm/java-8-openjdk-arm64`
  - `GLASSFISH_HOME=/opt/glassfish4`
  - `ANT_HOME=/opt/apache-ant-1.10.7`
  - `MYSQL_ROOT_PASSWORD=root` (for MySQL initialization)
  - `MYSQL_DATABASE=hotel_reservation_system`
- Volumes:
  - Mount project source: `./hotel-monolith:/workspaces/hotel-monorepo/hotel-monolith`
  - GlassFish domain data: `hotel-monolith-glassfish-data`
  - MySQL data: `hotel-monolith-mysql-data` (persistent database storage)
- Command: `scripts/start-services.sh` (adapted from existing scripts, see section 1.3)

**Architecture**: Single container runs both MySQL server (as systemd service) and GlassFish application server. This matches the existing DevContainer pattern and simplifies the setup.

#### 1.3 Adapt Existing Scripts for Docker Compose
**Location**: `/workspaces/hotel-monorepo/hotel-monolith/scripts/`

**Approach**: Adapt existing scripts rather than creating new ones from scratch. The hotel-monolith already has working scripts that can be refactored for Docker Compose. Since MySQL and GlassFish run in the same container, minimal changes are needed.

**Existing Scripts to Adapt**:

1. **`.devcontainer/setup.sh`** (lines 32-120) contains:
   - Database initialization logic (lines 60-69)
   - GlassFish JDBC configuration (lines 94-120)
   - Service startup logic

2. **`deploy.sh`** contains:
   - Build process (lines 24-41)
   - Deployment to GlassFish (lines 44-75)
   - Service checks (lines 10-22)

**Scripts to Create/Adapt**:

1. **`init-database.sh`** - Extract and adapt database initialization from `.devcontainer/setup.sh`
   - **Changes needed**:
     - Keep `sudo service mysql start` (MySQL runs as service in same container)
     - Keep `localhost` connection (no networking changes needed)
     - Keep idempotent logic: `CREATE DATABASE IF NOT EXISTS`
     - Load schema from `database/sql_queries.sql`
     - Fix socket permissions: `sudo chmod 755 /var/run/mysqld/`
     - Minimal changes from existing setup.sh logic

2. **`configure-glassfish.sh`** - Extract and adapt GlassFish configuration from `.devcontainer/setup.sh`
   - **Changes needed**:
     - Keep `localhost:3306` connection (MySQL is local)
     - Use environment variables for credentials if provided, otherwise defaults
     - Keep graceful handling: delete existing resources before creating new ones
     - Test connection pool after creation
     - Minimal changes from existing setup.sh logic

3. **`build-and-deploy.sh`** - Adapt `deploy.sh` for Docker environment
   - **Changes needed**:
     - Keep MySQL service check (`sudo service mysql status`) - MySQL is in same container
     - Remove GlassFish service start check - GlassFish will be started by orchestrator
     - Keep build logic (Ant commands)
     - Keep deployment logic (undeploy + deploy)
     - Use environment variables for paths if needed

4. **`start-services.sh`** - New orchestrator script
   - **Purpose**: Main entrypoint that coordinates all steps
   - **Functions**:
     1. Start MySQL service (`sudo service mysql start`)
     2. Wait for MySQL to be ready
     3. Run `init-database.sh` to initialize database schema
     4. Start GlassFish domain
     5. Wait for GlassFish to be ready
     6. Run `configure-glassfish.sh` to set up JDBC resources
     7. Run `build-and-deploy.sh` to build and deploy application
     8. Keep GlassFish running (tail logs or keep process alive)

**Key Principles**:
- **Reuse existing logic**: Extract working code from existing scripts with minimal changes
- **Local service management**: Keep `sudo service mysql start` since MySQL runs in same container
- **Localhost connections**: Use `localhost:3306` for MySQL connections (no Docker networking needed)
- **Idempotency**: Database initialization should check if exists before creating
- **Graceful handling**: GlassFish configuration should handle existing resources gracefully
- **Error handling**: Maintain robust error checking from original scripts
- **Simplified architecture**: Single container eliminates need for service discovery and networking

#### 1.4 Update docker-compose.yml (Phase 1 Section)
Add to root `docker-compose.yml`:

```yaml
services:
  hotel-monolith:
    build:
      context: ./hotel-monolith
      dockerfile: Dockerfile
    container_name: hotel-monolith
    working_dir: /workspaces/hotel-monorepo/hotel-monolith
    ports:
      - "8080:8080"  # HTTP
      - "4849:4848"  # Admin
      - "3307:3306"  # MySQL (optional, for host access)
    environment:
      - JAVA_HOME=/usr/lib/jvm/java-8-openjdk-arm64
      - GLASSFISH_HOME=/opt/glassfish4
      - ANT_HOME=/opt/apache-ant-1.10.7
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=hotel_reservation_system
    volumes:
      - ./hotel-monolith:/workspaces/hotel-monorepo/hotel-monolith
      - hotel-monolith-glassfish-data:/opt/glassfish4/glassfish/domains/domain1
      - hotel-monolith-mysql-data:/var/lib/mysql
    command: scripts/start-services.sh
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/HotelReservation-war/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  hotel-monolith-glassfish-data:
  hotel-monolith-mysql-data:
```

**Note**: No network configuration needed - single container means services communicate via localhost.

#### 1.5 Testing & Validation
- Verify container starts successfully
- Verify MySQL service starts and initializes schema within container
- Verify GlassFish starts and connects to MySQL (localhost)
- Verify application builds successfully
- Verify application deploys to GlassFish
- Test application access at `http://localhost:8080/HotelReservation-war/`
- Test GlassFish admin console at `http://localhost:4849`
- Test MySQL connection from host (optional): `mysql -h localhost -P 3307 -u root -proot`
- Verify data persistence across container restarts (volumes)

### Deliverables
1. `hotel-monolith/Dockerfile` (installs both MySQL server and GlassFish)
2. `hotel-monolith/scripts/init-database.sh` (adapted from `.devcontainer/setup.sh`)
3. `hotel-monolith/scripts/configure-glassfish.sh` (adapted from `.devcontainer/setup.sh`)
4. `hotel-monolith/scripts/build-and-deploy.sh` (adapted from `deploy.sh`)
5. `hotel-monolith/scripts/start-services.sh` (new orchestrator script)
6. Updated root `docker-compose.yml` with Phase 1 service (single container)
7. Documentation for Phase 1 in `hotel-monolith/docs/DOCKER_SETUP.md`

**Note**: Scripts 2-4 are adaptations of existing scripts with minimal changes. This single-container approach:
- **Matches DevContainer pattern**: Same architecture as existing `.devcontainer/Dockerfile`
- **Simplifies implementation**: No Docker networking or service discovery needed
- **Reduces complexity**: One service instead of two, easier to manage
- **Minimal script changes**: Existing scripts work with localhost connections
- **Better for monoliths**: Appropriate architecture for legacy monolithic applications
- **Trade-off**: Less modular (can't scale MySQL independently), but suitable for Phase 1

---

## Phase 2: hotel-api-rest Service

### Objective
Containerize and orchestrate the modernized Java EE application with REST API (identical stack to hotel-monolith but with REST endpoints).

### Service Architecture
- **Application Server**: GlassFish 4.1.1
- **Database**: MySQL 8.0
- **Build Tool**: Apache Ant
- **Java Version**: OpenJDK 8
- **Additional**: JAX-RS REST API endpoints

### Implementation Tasks

#### 2.1 Create Dockerfile for hotel-api-rest
**Location**: `/workspaces/hotel-monorepo/hotel-api-rest/Dockerfile`

**Requirements**:
- Base on existing `.devcontainer/Dockerfile` structure (same as Phase 1's Dockerfile pattern)
- Install: Java 8, Ant 1.10.7, GlassFish 4.1.1, MySQL server (both MySQL and GlassFish run in same container)
- Download required JAR dependencies (MySQL connector, JSTL, Commons Codec)
- **Install Jackson JAXB annotations module** (lines 49-50 from `.devcontainer/Dockerfile`): 
  - Download `jackson-module-jaxb-annotations-2.5.1.jar` to `/opt/glassfish4/glassfish/modules/`
  - This module is required for JSON deserialization support in the REST API
- Configure GlassFish with MySQL driver and Jackson module
- Set up build properties
- Note: Startup logic will use adapted existing scripts (see section 2.3)

**Key Configuration**:
- MySQL connection: `localhost:3306` (MySQL runs as service in same container)
- Database: `hotel_reservation_system`
- Credentials: `root:root` (configurable via environment variables)
- GlassFish ports: `8080` (HTTP), `4848` (Admin)
- MySQL port: `3306` (exposed for optional host access)
- JDBC Pool: `HotelReservationPool`
- JDBC Resource JNDI: `hotel`
- REST API base path: `/HotelReservation-war/api`

**Rationale**: Single-container approach matches existing DevContainer setup and Phase 1 implementation, simplifies architecture, and requires minimal script changes. The Jackson JAXB module enables proper JSON serialization/deserialization for REST endpoints.

#### 2.2 Create Single Container Service
**Service Name**: `hotel-api-rest`

**Configuration**:
- Build from: `hotel-api-rest/Dockerfile`
- Working directory: `/workspaces/hotel-monorepo/hotel-api-rest`
- Ports:
  - `8080:8080` (HTTP)
  - `4850:4848` (Admin - mapped to 4850)
  - `3308:3306` (MySQL - mapped to 3308 to avoid conflict with host MySQL and hotel-monolith)
- Environment variables:
  - `JAVA_HOME=/usr/lib/jvm/java-8-openjdk-arm64`
  - `GLASSFISH_HOME=/opt/glassfish4`
  - `ANT_HOME=/opt/apache-ant-1.10.7`
  - `MYSQL_ROOT_PASSWORD=root` (for MySQL initialization)
  - `MYSQL_DATABASE=hotel_reservation_system`
- Volumes:
  - Mount project source: `./hotel-api-rest:/workspaces/hotel-monorepo/hotel-api-rest`
  - GlassFish domain data: `hotel-api-rest-glassfish-data`
  - MySQL data: `hotel-api-rest-mysql-data` (persistent database storage)
- Command: `scripts/start-services.sh` (adapted from existing scripts, see section 2.3)

**Architecture**: Single container runs both MySQL server (as systemd service) and GlassFish application server. This matches the existing DevContainer pattern and Phase 1 implementation, simplifying the setup. The Jackson JAXB module installed in the Dockerfile enables REST API JSON serialization/deserialization.

#### 2.3 Adapt Existing Scripts for Docker Compose
**Location**: `/workspaces/hotel-monorepo/hotel-api-rest/scripts/`

**Approach**: Adapt existing scripts rather than creating new ones from scratch. The hotel-api-rest already has working scripts that can be refactored for Docker Compose. Since MySQL and GlassFish run in the same container, minimal changes are needed.

**Existing Scripts to Adapt**:

1. **`.devcontainer/setup.sh`** (if exists, similar to hotel-monolith) contains:
   - Database initialization logic
   - GlassFish JDBC configuration
   - Service startup logic

2. **`deploy.sh`** contains:
   - Build process
   - Deployment to GlassFish
   - Service checks

**Scripts to Create/Adapt**:

1. **`init-database.sh`** - Extract and adapt database initialization from `.devcontainer/setup.sh` (or create new)
   - **Changes needed**:
     - Keep `sudo service mysql start` (MySQL runs as service in same container)
     - Keep `localhost` connection (no networking changes needed)
     - Keep idempotent logic: `CREATE DATABASE IF NOT EXISTS`
     - Load schema from `database/sql_queries.sql`
     - Fix socket permissions: `sudo chmod 755 /var/run/mysqld/`
     - Minimal changes from existing setup.sh logic

2. **`configure-glassfish.sh`** - Extract and adapt GlassFish configuration from `.devcontainer/setup.sh` (or create new)
   - **Changes needed**:
     - Keep `localhost:3306` connection (MySQL is local)
     - Use environment variables for credentials if provided, otherwise defaults
     - Keep graceful handling: delete existing resources before creating new ones
     - Test connection pool after creation
     - Ensure Jackson JAXB annotations module is available (already in Dockerfile)
     - Minimal changes from existing setup.sh logic

3. **`build-and-deploy.sh`** - Adapt `deploy.sh` for Docker environment
   - **Changes needed**:
     - Keep MySQL service check (`sudo service mysql status`) - MySQL is in same container
     - Remove GlassFish service start check - GlassFish will be started by orchestrator
     - Keep build logic (Ant commands)
     - Keep deployment logic (undeploy + deploy)
     - Use environment variables for paths if needed
     - Verify REST API endpoints are accessible after deployment (test `/api/rooms` endpoint)

4. **`start-services.sh`** - New orchestrator script
   - **Purpose**: Main entrypoint that coordinates all steps
   - **Functions**:
     1. Start MySQL service (`sudo service mysql start`)
     2. Wait for MySQL to be ready
     3. Run `init-database.sh` to initialize database schema
     4. Start GlassFish domain
     5. Wait for GlassFish to be ready
     6. Run `configure-glassfish.sh` to set up JDBC resources
     7. Run `build-and-deploy.sh` to build and deploy application
     8. Keep GlassFish running (tail logs or keep process alive)

**Key Principles**:
- **Reuse existing logic**: Extract working code from existing scripts with minimal changes
- **Local service management**: Keep `sudo service mysql start` since MySQL runs in same container
- **Localhost connections**: Use `localhost:3306` for MySQL connections (no Docker networking needed)
- **Idempotency**: Database initialization should check if exists before creating
- **Graceful handling**: GlassFish configuration should handle existing resources gracefully
- **Error handling**: Maintain robust error checking from original scripts
- **Simplified architecture**: Single container eliminates need for service discovery and networking
- **REST API verification**: Ensure REST endpoints are tested after deployment

#### 2.4 Update docker-compose.yml (Phase 2 Section)
Add to root `docker-compose.yml`:

```yaml
services:
  hotel-api-rest:
    build:
      context: ./hotel-api-rest
      dockerfile: Dockerfile
    container_name: hotel-api-rest
    working_dir: /workspaces/hotel-monorepo/hotel-api-rest
    ports:
      - "8080:8080"  # HTTP
      - "4850:4848"  # Admin
      - "3308:3306"  # MySQL (optional, for host access)
    environment:
      - JAVA_HOME=/usr/lib/jvm/java-8-openjdk-arm64
      - GLASSFISH_HOME=/opt/glassfish4
      - ANT_HOME=/opt/apache-ant-1.10.7
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=hotel_reservation_system
    volumes:
      - ./hotel-api-rest:/workspaces/hotel-monorepo/hotel-api-rest
      - hotel-api-rest-glassfish-data:/opt/glassfish4/glassfish/domains/domain1
      - hotel-api-rest-mysql-data:/var/lib/mysql
    command: scripts/start-services.sh
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/HotelReservation-war/api/rooms"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  hotel-api-rest-glassfish-data:
  hotel-api-rest-mysql-data:
```

**Note**: No network configuration needed - single container means services communicate via localhost. The healthcheck verifies REST API endpoint availability, ensuring the service is accessible for hotel-ui-react (Phase 3 dependency).

#### 2.5 Testing & Validation
- Verify container starts successfully
- Verify MySQL service starts and initializes schema within container
- Verify GlassFish starts and connects to MySQL (localhost)
- Verify application builds successfully
- Verify application deploys to GlassFish
- Test web application at `http://localhost:8080/HotelReservation-war/`
- Test REST API endpoints:
  - `GET http://localhost:8080/HotelReservation-war/api/rooms`
  - `GET http://localhost:8080/HotelReservation-war/api/reservations`
- Test GlassFish admin console at `http://localhost:4850`
- Test MySQL connection from host (optional): `mysql -h localhost -P 3308 -u root -proot`
- Verify data persistence across container restarts (volumes)
- Verify REST API endpoints are accessible for hotel-ui-react integration (Phase 3 dependency)

### Deliverables
1. `hotel-api-rest/Dockerfile` (installs both MySQL server and GlassFish, includes Jackson JAXB module)
2. `hotel-api-rest/scripts/init-database.sh` (adapted from `.devcontainer/setup.sh` or created new)
3. `hotel-api-rest/scripts/configure-glassfish.sh` (adapted from `.devcontainer/setup.sh` or created new)
4. `hotel-api-rest/scripts/build-and-deploy.sh` (adapted from `deploy.sh`)
5. `hotel-api-rest/scripts/start-services.sh` (new orchestrator script)
6. Updated root `docker-compose.yml` with Phase 2 service (single container)
7. Documentation for Phase 2 in `hotel-api-rest/docs/DOCKER_SETUP.md`

**Note**: Scripts 2-4 are adaptations of existing scripts with minimal changes. This single-container approach:
- **Matches DevContainer pattern**: Same architecture as existing `.devcontainer/Dockerfile` and Phase 1 implementation
- **Simplifies implementation**: No Docker networking or service discovery needed
- **Reduces complexity**: One service instead of two, easier to manage
- **Minimal script changes**: Existing scripts work with localhost connections
- **REST API support**: Jackson JAXB module enables JSON serialization/deserialization
- **UI accessibility**: Service accessible on port 8080 for hotel-ui-react (Phase 3 dependency)
- **Trade-off**: Less modular (can't scale MySQL independently), but suitable for Phase 2 migration demonstration

---

## Phase 3: hotel-ui-react Service

### Objective
Containerize and orchestrate the React SPA frontend that consumes the REST API from hotel-api-rest.

### Service Architecture
- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 5.0
- **Runtime**: Node.js 20+
- **API Dependency**: hotel-api-rest service

### Implementation Tasks

#### 3.1 Create Dockerfile for hotel-ui-react
**Location**: `/workspaces/hotel-monorepo/hotel-ui-react/Dockerfile`

**Requirements**:
- Base image: `node:20-alpine` (lightweight)
- Install dependencies: `npm install`
- Expose port `5173`
- Run `npm run dev` (Vite dev server)

**Note**: This Dockerfile is for development/demo purposes only. For production deployments, the React app should be built (`npm run build`) and the static assets in `dist/` should be deployed to a static hosting service (e.g., Netlify, Vercel, S3+CloudFront) rather than using a containerized nginx service.

#### 3.2 Create Container Service
**Service Name**: `hotel-ui-react`

**Configuration**:
- Build from: `hotel-ui-react/Dockerfile`
- Working directory: `/workspaces/hotel-monorepo/hotel-ui-react`
- Port: `5173:5173` (Vite dev server)
- Environment variables:
  - `NODE_ENV=development`
  - `VITE_API_URL=http://hotel-api-rest:8080/HotelReservation-war` (for container-to-container communication)
- Volumes:
  - Mount project source: `./hotel-ui-react:/workspaces/hotel-monorepo/hotel-ui-react`
  - Node modules: `hotel-ui-react-node-modules` (for performance)
- Command: `npm run dev`
- Depends on: `hotel-api-rest` (with health check)

#### 3.3 Update Vite Configuration
**Location**: `/workspaces/hotel-monorepo/hotel-ui-react/vite.config.ts`

**Changes Needed**:
- Update proxy configuration to work in both DevContainer and Docker Compose environments
- Development (DevContainer): Proxy to the host backend via `VITE_API_URL` (typically `http://host.docker.internal:8080/HotelReservation-war`)
- Development (docker-compose): Proxy to `http://hotel-api-rest:8080/HotelReservation-war` via `VITE_API_URL`
- Production: Use environment variable `VITE_API_URL` at build time

**Proxy Configuration**:
```typescript
proxy: {
  "/api": {
    target: process.env.VITE_API_URL || "http://hotel-api-rest:8080/HotelReservation-war",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, "/api"),
  },
}
```

**Usage Notes**:
- The React app always calls **relative paths** such as `/api/rooms` and `/api/reservations`.
- In a **DevContainer**, `VITE_API_URL` is typically set to `http://host.docker.internal:8080/HotelReservation-war`, allowing the Node/Vite process to reach a backend running on the host.
- In **docker-compose**, `VITE_API_URL` is set on the `hotel-ui-react` service to `http://hotel-api-rest:8080/HotelReservation-war`, using Docker's internal service name.

#### 3.4 Update docker-compose.yml (Phase 3 Section)
Add to root `docker-compose.yml`:

```yaml
services:
  hotel-ui-react:
    build:
      context: ./hotel-ui-react
      dockerfile: Dockerfile
    container_name: hotel-ui-react
    working_dir: /workspaces/hotel-monorepo/hotel-ui-react
    ports:
      - "5173:5173"  # Vite dev server
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://hotel-api-rest:8080/HotelReservation-war
    volumes:
      - ${HOTEL_UI_REACT_PATH:-./hotel-ui-react}:/workspaces/hotel-monorepo/hotel-ui-react
      - hotel-ui-react-node-modules:/workspaces/hotel-monorepo/hotel-ui-react/node_modules
    depends_on:
      hotel-api-rest:
        condition: service_healthy

volumes:
  hotel-ui-react-node-modules:
    # Persistent volume for frontend node_modules
```

#### 3.5 Network Configuration
- By default, Docker Compose creates a **single bridge network** for all services in this file.
- `hotel-ui-react`, `hotel-api-rest`, and `hotel-monolith` all share this default network.
- The React container connects to the backend via the service name: `http://hotel-api-rest:8080/HotelReservation-war`.
- Optionally, introduce a named network (for example, `hotel-network`) for clearer topology or stronger isolation, but this is **not required** for the demo.
- Because the React app uses a Vite proxy and relative `/api/*` paths, CORS issues are avoided without additional backend configuration in most cases.

#### 3.6 Environment Variable Handling

**Host Path Configuration**:

**`HOTEL_UI_REACT_PATH`**: Path to the `hotel-ui-react` directory on the host filesystem.

This variable is used for the volume mount and allows Docker Compose to work from both Mac host terminal and devcontainer environments, consistent with `hotel-monolith` and `hotel-api-rest`.

- **Using from Mac Host Terminal**:
  - When running `docker compose` from your Mac terminal, you can use the default relative path (no configuration needed).
  - Or create a `.env` file in the monorepo root:
    ```env
    HOTEL_UI_REACT_PATH=./hotel-ui-react
    ```

- **Using from DevContainer**:
  - When running `docker compose` from inside a devcontainer, you need to set the absolute Mac host path.
  - Create a `.env` file in the monorepo root:
    ```env
    HOTEL_UI_REACT_PATH=/Users/username/path/to/hotel-monorepo/hotel-ui-react
    ```
  - Replace `/Users/username/path/to/hotel-monorepo` with your actual Mac path.

**Vite API URL Configuration**:

- **Development**:
  - Use the Vite proxy (configured in `vite.config.ts`) so the browser always talks to `http://localhost:5173`, avoiding CORS.
  - In DevContainer, set `VITE_API_URL` to `http://host.docker.internal:8080/HotelReservation-war` (usually via `.devcontainer` config).
  - In docker-compose, set `VITE_API_URL` on `hotel-ui-react` to `http://hotel-api-rest:8080/HotelReservation-war`.
- **Production**:
  - Set `VITE_API_URL` at build time so the generated static assets know which backend to call.
  - This can be done via `.env.production` inside `hotel-ui-react` or via environment variables in the build process.
  - For production, build the app (`npm run build`) and deploy the `dist/` directory to a static hosting service (e.g., Netlify, Vercel, S3+CloudFront) rather than using a containerized service.
- **Documentation**:
  - Create `.env.example` in `hotel-ui-react` showing typical values for `VITE_API_URL` in DevContainer, docker-compose, and production scenarios.

#### 3.7 Testing & Validation
- Verify Node.js container starts
- Verify dependencies install correctly
- Verify Vite dev server starts on port 5173
- Test frontend access at `http://localhost:5173`
- Test API proxy: Verify requests to `/api/rooms` and `/api/reservations` are proxied correctly to `hotel-api-rest`
- Test full user flow: Search rooms, view details, create reservation
- Verify CORS is not an issue (proxy handles it)

### Deliverables
1. `hotel-ui-react/Dockerfile` (for development/demo)
2. Updated `hotel-ui-react/vite.config.ts` with Docker network support
3. `hotel-ui-react/.env.example` with environment variable documentation
4. Updated root `docker-compose.yml` with Phase 3 service
5. Documentation for Phase 3 in `hotel-ui-react/docs/DOCKER_SETUP.md`

---

## Phase 4: hotel-db-postgres Service

### Objective
Containerize and orchestrate the PostgreSQL database service for future migration projects.

### Service Architecture
- **Database**: PostgreSQL 15
- **Purpose**: Standalone database service for future migrations
- **No Dependencies**: Independent service

### Implementation Tasks

#### 4.1 Review Existing docker-compose.yml
**Location**: `/workspaces/hotel-monorepo/hotel-db-postgres/docker-compose.yml`

**Current Configuration**:
- Service name: `hotel-postgres-standalone`
- Image: `postgres:15-alpine`
- Port: `5432:5432`
- Network: `hotel-shared-network`
- Volumes: Schema initialization scripts

**Action**: Review and adapt for monorepo root docker-compose.yml

#### 4.2 Integrate into Root docker-compose.yml
**Service Name**: `hotel-db-postgres`

**Configuration**:
- Image: `postgres:15-alpine`
- Container name: `hotel-postgres-standalone` (maintain consistency)
- Port: `5432:5432`
- Environment variables:
  - `POSTGRES_DB=hotel_reservation`
  - `POSTGRES_USER=postgres`
  - `POSTGRES_PASSWORD=postgres`
  - `POSTGRES_INITDB_ARGS=--encoding=UTF8 --locale=en_US.UTF-8`
- Volumes:
  - Persistent data: `hotel-postgres-data` (reuse existing volume name)
  - Schema scripts: `./hotel-db-postgres/schema:/docker-entrypoint-initdb.d:ro`
  - Backups: `./hotel-db-postgres/backups:/backups`
- Health check:
  - Test: `pg_isready -U postgres -d hotel_reservation`
  - Interval: 10s
  - Timeout: 5s
  - Retries: 5
  - Start period: 30s
- Performance tuning (command):
  - `shared_buffers=256MB`
  - `max_connections=200`
  - `log_statement=all`

#### 4.3 Network Configuration
- Network: `hotel-shared-network` (reuse existing network name)
- This network will be shared with future services that need PostgreSQL
- Ensure network is created if it doesn't exist

#### 4.4 Update docker-compose.yml (Phase 4 Section)
Add to root `docker-compose.yml`:

```yaml
services:
  hotel-db-postgres:
    # PostgreSQL service configuration
    
volumes:
  hotel-postgres-data:
    # Persistent data volume
    
networks:
  hotel-shared-network:
    # Shared network for future services
```

#### 4.5 Volume Management
- Ensure volume name matches existing: `hotel-postgres-data`
- Document volume backup and restore procedures
- Consider volume migration if needed

#### 4.6 Testing & Validation
- Verify PostgreSQL container starts
- Verify database `hotel_reservation` is created
- Verify schema initialization scripts run correctly
- Verify seed data is loaded (if applicable)
- Test connection from host: `psql -h localhost -U postgres -d hotel_reservation`
- Test connection from other containers (future services)
- Verify health check works correctly
- Test backup functionality

### Deliverables
1. Updated root `docker-compose.yml` with Phase 4 service
2. Network configuration: `hotel-shared-network`
3. Volume configuration: `hotel-postgres-data`
4. Documentation for Phase 4 in `hotel-db-postgres/docs/DOCKER_SETUP.md`
5. Integration guide for future services that will use this database

---

## Root docker-compose.yml Structure

### Final Structure Overview

```yaml
version: '3.8'

services:
  # Phase 1: hotel-monolith (single container with MySQL + GlassFish)
  hotel-monolith:
    # MySQL server + GlassFish application server
    
  # Phase 2: hotel-api-rest
  hotel-api-rest-mysql:
    # MySQL service
    
  hotel-api-rest-app:
    # GlassFish application
    
  # Phase 3: hotel-ui-react
  hotel-ui-react:
    # React development server
    
  # Phase 4: hotel-db-postgres
  hotel-db-postgres:
    # PostgreSQL service

volumes:
  # Persistent volumes for databases and application data
  
networks:
  # Networks for service communication
```

### Network Strategy

**Phase 1 (hotel-monolith)**: No network needed - single container runs both MySQL and GlassFish, services communicate via localhost.

**Phases 2-4**:
- **Option 1: Separate Networks (Recommended for Isolation)**
  - `hotel-api-rest-network` - For hotel-api-rest and hotel-ui-react
  - `hotel-shared-network` - For hotel-db-postgres and future services

- **Option 2: Single Shared Network**
  - `hotel-network` - All services on one network
  - Simpler but less isolation

### Port Mapping Strategy

| Service | Internal Port | External Port | Purpose |
|---------|---------------|---------------|---------|
| hotel-monolith | 8080 | 8080 | HTTP |
| hotel-monolith | 4848 | 4849 | Admin |
| hotel-monolith | 3306 | 3307 | MySQL |
| hotel-api-rest-app | 8080 | 8080 | HTTP |
| hotel-api-rest-app | 4848 | 4850 | Admin |
| hotel-api-rest-mysql | 3306 | 3308 | MySQL |
| hotel-ui-react | 5173 | 5173 | Vite Dev |
| hotel-db-postgres | 5432 | 5432 | PostgreSQL |

### Environment Variables

Create `.env` file in root for configuration:

```env
# MySQL Configuration
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=hotel_reservation_system

# PostgreSQL Configuration
POSTGRES_DB=hotel_reservation
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# GlassFish Configuration
GLASSFISH_ADMIN_PORT=4848
GLASSFISH_HTTP_PORT=8080

# Host Path Configuration (for devcontainer usage)
# When running docker-compose from inside a devcontainer, set these to absolute Mac host paths
# Example: /Users/username/path/to/hotel-monorepo/hotel-monolith
HOTEL_MONOLITH_PATH=./hotel-monolith
HOTEL_API_REST_PATH=./hotel-api-rest
HOTEL_UI_REACT_PATH=./hotel-ui-react

# React Configuration
VITE_API_URL=http://localhost:8080/HotelReservation-war
```

---

## Implementation Order

1. **Phase 1** - hotel-monolith (Independent, no dependencies)
2. **Phase 2** - hotel-api-rest (Independent, no dependencies)
3. **Phase 3** - hotel-ui-react (Depends on Phase 2)
4. **Phase 4** - hotel-db-postgres (Independent, no dependencies, can be done in parallel)

---

## Common Considerations

### Health Checks
All services should include health checks to ensure proper startup ordering and monitoring.

### Logging
- Configure logging for all services
- Consider centralized logging solution for production
- Use Docker logging drivers as needed

### Data Persistence
- All database volumes should be named and persistent
- Document backup and restore procedures
- Consider data migration strategies

### Security
- Use environment variables for sensitive data
- Consider secrets management for production
- Review network isolation requirements
- Document security best practices

### Development vs Production
- Development: Use volume mounts for live code editing
- Production: Use built images with copied files
- Consider separate docker-compose files: `docker-compose.dev.yml` and `docker-compose.prod.yml`

### Documentation
Each phase should include:
- Setup instructions
- Configuration details
- Troubleshooting guide
- API/Service endpoints
- Testing procedures

---

## Success Criteria

### Phase 1 Success
- ✅ Container starts successfully
- ✅ MySQL service starts and initializes database within container
- ✅ GlassFish starts and connects to MySQL (localhost)
- ✅ Application builds and deploys successfully
- ✅ Application accessible at `http://localhost:8080/HotelReservation-war/`
- ✅ All services can be started with `docker-compose up hotel-monolith`

### Phase 2 Success
- ✅ MySQL container starts and initializes database
- ✅ GlassFish container starts and connects to MySQL
- ✅ Application builds and deploys successfully
- ✅ Web application accessible at `http://localhost:8080/HotelReservation-war/`
- ✅ REST API endpoints accessible at `http://localhost:8080/HotelReservation-war/api/*`
- ✅ All services can be started with `docker-compose up hotel-api-rest-mysql hotel-api-rest-app`

### Phase 3 Success
- ✅ React container starts and installs dependencies
- ✅ Vite dev server runs on port 5173
- ✅ Frontend accessible at `http://localhost:5173`
- ✅ API proxy correctly forwards requests to hotel-api-rest
- ✅ Full user flow works (search, view, reserve)
- ✅ Service can be started with `docker-compose up hotel-ui-react` (after Phase 2)

### Phase 4 Success
- ✅ PostgreSQL container starts
- ✅ Database `hotel_reservation` is created
- ✅ Schema initialization scripts run successfully
- ✅ Database accessible at `localhost:5432`
- ✅ Health check passes
- ✅ Service can be started with `docker-compose up hotel-db-postgres`

### Overall Success
- ✅ All services can be started together: `docker-compose up`
- ✅ Services can be started individually: `docker-compose up <service-name>`
- ✅ Services can be stopped: `docker-compose down`
- ✅ Data persists across container restarts
- ✅ Documentation is complete and accurate

---

## Next Steps After Implementation

1. **Testing**: Comprehensive integration testing across all services
2. **CI/CD**: Consider adding Docker build and test to CI pipeline
3. **Monitoring**: Add health check endpoints and monitoring
4. **Performance**: Optimize container images and startup times
5. **Documentation**: Create user guides and troubleshooting docs
6. **Production Readiness**: Review security, scaling, and deployment strategies

---

## Notes

- Each phase is designed to be implemented independently
- Services are designed to be runnable both individually and together
- Port conflicts are avoided by using different external ports
- Network isolation provides security and clarity
- Volume persistence ensures data survives container restarts
- Health checks ensure proper startup ordering
- Documentation is critical for maintainability

