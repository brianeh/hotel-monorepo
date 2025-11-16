# Migration Monorepo Tooling

This repository aggregates the hotel modernization projects so you can validate connectivity paths between the legacy monolith, the modern REST API, the React UI, and the shared Postgres database.

## Dev Container

### Open the dev container

1. Install Docker Desktop and ensure it is running.
2. Install VS Code with the Dev Containers extension or use `devcontainer` CLI.
3. Open the repository folder and run **Dev Containers: Reopen in Container**.

The container image builds from `.devcontainer/Dockerfile`, layering Python 3.12 with `pipx`, `uv`, `ruff`, plus the Docker CLI and PostgreSQL client (`psql`) for administrative tasks. The host Docker socket is mounted so you can control other containers from inside the workspace.

If your host Docker daemon uses a non-default group id, export it before reopening the container so build-time permissions line up:

```bash
export DOCKER_GID=$(stat -c '%g' /var/run/docker.sock)   # macOS: stat -f '%g'
```

The devcontainer automatically reconfigures the socket permissions on start, so once rebuilt you can run `docker compose` without `sudo`.

The devcontainer exports `HOST_WORKSPACE` pointing at the host path of this repo so Compose can bind-mount the project correctly from inside the container. If you launch Docker commands from another environment, set `HOST_WORKSPACE` yourself (for example, `export HOST_WORKSPACE=$(pwd)`) before invoking Compose.

Once inside, Python tools are available globally:

```bash
python --version
uv --version
psql --version
docker --version
```

## Docker Compose Stack

The root `docker-compose.yml` defines four services on the shared `hotel-shared-network`. Every service exposes a profile so you can start them independently or together:

```bash
# Database only (default port 5432)
docker compose --profile db up hotel-db-postgres

# REST API toolkit container (waits for manual deploy steps)
docker compose --profile api up hotel-api-rest

# React UI pointing at the REST API proxy target
docker compose --profile ui up hotel-ui-react

# Legacy monolith toolkit container
docker compose --profile monolith up hotel-monolith

# Bring the entire stack up
docker compose --profile all up
```

### Service details

- `hotel-db-postgres`  
  Based on `postgres:15-alpine` with schema files from `hotel-db-postgres/schema`. Health checks gate the API and monolith containers.

- `hotel-api-rest`  
  Reuses the project-specific devcontainer image so GlassFish, Ant, and supporting tools are available. The container idles (`tail -f /dev/null`) so you can `docker compose exec hotel-api-rest bash` and run `./deploy.sh`, configure JDBC resources, or point the application at Postgres using the injected `DB_*` environment variables. The service advertises itself as `host.docker.internal` on the shared network so the React proxy works without code changes.

- `hotel-ui-react`  
  Runs the Vite dev server (`pnpm dev --host 0.0.0.0 --port 5173`) after installing dependencies. The proxy in `vite.config.ts` hits `http://host.docker.internal:8080/HotelReservation-war` which resolves to the API container because of the network alias.

- `hotel-monolith`  
  Lightweight Java 8 + Ant image for interacting with the legacy EAR project. Like the API container it simply idles; open a shell to execute build or deployment scripts against the shared Postgres instance using the same `DB_*` variables.

### Data volume

The Postgres container stores data in the named volume `hotel-postgres-data`. Remove it explicitly (`docker volume rm hotel-postgres-data`) if you need a clean slate.

### Common troubleshooting

- Check database readiness: `docker compose ps` or `docker compose logs hotel-db-postgres`
- Access Postgres from API container: `docker compose exec hotel-api-rest psql -h ${DB_HOST} -U ${DB_USER} ${DB_NAME}`
- Rebuild images after Dockerfile changes: `docker compose build hotel-api-rest`

## Next Steps

- Tailor the API and monolith deployments to use Postgres by updating their GlassFish JDBC pools or persistence descriptors.
- Extend the Compose profiles with health checks or automatic startup commands once the migration scripts are finalized.

