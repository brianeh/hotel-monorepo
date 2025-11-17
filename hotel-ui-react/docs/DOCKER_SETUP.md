# Hotel UI React - Docker Compose Setup Guide

## Overview

This document describes how to run the hotel-ui-react application using Docker Compose. The setup provides a containerized React development environment that consumes the REST API from the `hotel-api-rest` service. This demonstrates how a modern React frontend can be fully decoupled from a legacy Java EE backend.

## Architecture

- **Single Container**: Node.js 20 with Vite dev server
- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 5.0
- **API Dependency**: hotel-api-rest service (must be running)
- **Development Mode**: Hot module replacement (HMR) enabled for live code editing

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- `hotel-api-rest` service running and healthy (Phase 2)
- Port 5173 available on the host

Note: Commands use Docker Compose V2 (`docker compose`). If you're on legacy Compose V1, substitute `docker-compose`.

## Quick Start

1. **Ensure hotel-api-rest is running**:
   ```bash
   docker compose up -d hotel-api-rest
   # Wait for it to be healthy
   docker compose ps hotel-api-rest
   ```

2. **Start the React frontend**:
   ```bash
   docker compose up hotel-ui-react
   ```

3. **Start in detached mode**:
   ```bash
   docker compose up -d hotel-ui-react
   ```

4. **View logs**:
   ```bash
   docker compose logs -f hotel-ui-react
   ```

5. **Stop the service**:
   ```bash
   docker compose stop hotel-ui-react
   ```

6. **Stop and remove containers**:
   ```bash
   docker compose down
   ```

## Access URLs

Once the container is running, you can access:

- **Frontend Application**: http://localhost:5173
- **API Proxy**: Requests to `/api/*` are automatically proxied to `hotel-api-rest`

## Integration with hotel-api-rest

The React application communicates with the backend via the Vite proxy:

- **Browser** makes request to `http://localhost:5173/api/rooms`
- **Vite dev server** (running in container) receives the request
- **Vite proxy** forwards it to `http://hotel-api-rest:8080/HotelReservation-war/api/rooms`
- **Backend API** processes the request and returns data
- **Response** flows back through the same path

This setup prevents CORS issues because the browser only talks to the Vite dev server (same origin), while the actual backend call is made by the Node.js process inside the container where the service name `hotel-api-rest` resolves correctly.

## Environment Variables

### Container Environment Variables

The following environment variables can be configured in `docker-compose.yml`:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Node.js environment mode |
| `VITE_API_URL` | `http://hotel-api-rest:8080/HotelReservation-war` | Backend API base URL for proxy |

### Host Path Configuration

**`HOTEL_UI_REACT_PATH`**: Path to the `hotel-ui-react` directory on the host filesystem.

This variable is used for the volume mount and allows Docker Compose to work from both Mac host terminal and devcontainer environments.

#### Using from Mac Host Terminal

When running `docker compose` from your Mac terminal, you can use the default relative path:

```bash
# Default behavior - no configuration needed
docker compose up -d hotel-ui-react
```

Or create a `.env` file in the monorepo root:

```env
# .env file (optional when running from Mac host)
HOTEL_UI_REACT_PATH=./hotel-ui-react
```

#### Using from DevContainer

When running `docker compose` from inside a devcontainer, you need to set the absolute Mac host path:

**Option 1: Using .env file** (Recommended)

Create a `.env` file in the monorepo root:

```env
# .env file in monorepo root
HOTEL_UI_REACT_PATH=/Users/username/path/to/hotel-modernization/hotel-ui-react
```

Replace `/Users/username/path/to/hotel-modernization` with your actual Mac path.

**Option 2: Using environment variable**

Export the variable in your devcontainer shell:

```bash
export HOTEL_UI_REACT_PATH=/Users/username/path/to/hotel-modernization/hotel-ui-react
docker compose up -d hotel-ui-react
```

**Finding your Mac host path:**

1. **From VS Code**: Check the workspace folder path shown in the Explorer
2. **From Mac Terminal**: Navigate to your monorepo and run `pwd`
3. **From devcontainer**: Inspect the devcontainer mount:
   ```bash
   docker inspect $(docker ps --filter "name=.*devcontainer.*" --format "{{.Names}}" | head -1) | grep -A 10 Mounts
   ```

**Example:**

If your monorepo is at `/Users/john/projects/hotel-modernization` on your Mac, then:

```env
HOTEL_UI_REACT_PATH=/Users/john/projects/hotel-modernization/hotel-ui-react
```

**Note**: The `.env` file is automatically loaded by Docker Compose when placed in the same directory as `docker-compose.yml`. See `.env.example` for a template.

## Volumes

The following volumes are used:

- **`hotel-ui-react-node-modules`**: Persistent volume for `node_modules` directory. This improves performance by avoiding reinstalling dependencies on every container start.

- **Source code mount**: The project source is mounted from the host, allowing live code editing with hot module replacement (HMR).

### Managing Volumes

**List volumes**:
```bash
docker volume ls | grep hotel-ui-react
```

**Inspect a volume**:
```bash
docker volume inspect hotel-ui-react-node-modules
```

**Remove volumes** (⚠️ This will delete node_modules cache):
```bash
docker compose down -v
```

## Development Workflow

### Making code changes

1. Edit source files in `hotel-ui-react/` directory on your host
2. Changes are automatically reflected in the container via volume mount
3. Vite's HMR automatically reloads the browser with your changes
4. No need to rebuild or restart the container

### Testing API integration

After making changes to API client code:

1. Check the browser console for any errors
2. Test API endpoints via the frontend UI
3. Check Vite dev server logs:
   ```bash
   docker compose logs -f hotel-ui-react
   ```
4. Verify backend is accessible:
   ```bash
   curl http://localhost:8080/HotelReservation-war/api/rooms
   ```

### Viewing application logs

```bash
# Follow logs in real-time
docker compose logs -f hotel-ui-react

# View last 100 lines
docker compose logs --tail=100 hotel-ui-react
```

### Accessing container shell

```bash
docker compose exec hotel-ui-react sh
```

## Troubleshooting

### Container fails to start

**Check logs**:
```bash
docker compose logs hotel-ui-react
```

**Common issues**:
- Port conflicts: Ensure port 5173 is not in use
- Insufficient resources: Ensure Docker has enough memory allocated
- Dependency installation failures: Check network connectivity

### Cannot connect to backend API

**Verify backend is running**:
```bash
docker compose ps hotel-api-rest
```

**Check backend health**:
```bash
docker compose exec hotel-api-rest curl -f http://localhost:8080/HotelReservation-war/api/rooms
```

**Test from React container**:
```bash
docker compose exec hotel-ui-react wget -O- http://hotel-api-rest:8080/HotelReservation-war/api/rooms
```

**Common issues**:
- Backend not healthy: Wait for `hotel-api-rest` health check to pass
- Network issues: Ensure both containers are on the same Docker network
- Wrong API URL: Verify `VITE_API_URL` environment variable is set correctly

### CORS errors

CORS should not be an issue as the Vite dev server acts as a proxy. All API requests go through the Vite dev server, which makes the backend requests from within the container.

If you still encounter CORS errors:
- Verify the proxy configuration in `vite.config.ts`
- Check that `VITE_API_URL` is set correctly
- Ensure requests are using relative paths (`/api/*`) not absolute URLs

### Hot module replacement not working

**Check volume mount**:
```bash
docker compose exec hotel-ui-react ls -la /workspaces/hotel-modernization/hotel-ui-react
```

**Verify file changes are detected**:
- Make a small change to a component
- Check Vite logs for HMR messages
- Ensure you're editing files in the mounted directory

### Dependencies not installing

**Clear node_modules volume and reinstall**:
```bash
docker compose down -v
docker compose up -d hotel-ui-react
```

**Manually reinstall**:
```bash
docker compose exec hotel-ui-react npm install
```

## Rebuilding the Container

If you make changes to the Dockerfile or need to rebuild:

```bash
docker compose build hotel-ui-react
docker compose up -d hotel-ui-react
```

Or force a rebuild without cache:

```bash
docker compose build --no-cache hotel-ui-react
```

## Health Check

The service depends on `hotel-api-rest` being healthy before starting. Docker Compose will wait for the backend health check to pass before starting the React container.

Check service status:
```bash
docker compose ps
```

## Cleanup

**Stop and remove containers** (keeps volumes):
```bash
docker compose down
```

**Stop and remove containers and volumes** (⚠️ deletes node_modules cache):
```bash
docker compose down -v
```

**Remove images**:
```bash
docker rmi $(docker images | grep hotel-ui-react | awk '{print $3}')
```

## Production Deployment

**Note**: This Dockerfile is for development/demo purposes only. For production deployments:

1. Build the React app:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` directory to a static hosting service:
   - **Netlify**: Connect your Git repository and set build command to `npm run build`
   - **Vercel**: Connect your Git repository and set build command to `npm run build`
   - **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket and configure CloudFront
   - **Other static hosts**: Upload `dist/` directory contents

3. Set `VITE_API_URL` environment variable at build time to point to your production API:
   ```bash
   VITE_API_URL=https://api.example.com/HotelReservation-war npm run build
   ```

The production build will have the API URL baked into the static assets, so the deployed app knows where to call the backend.

## Integration with hotel-api-rest

This service is designed to work with the `hotel-api-rest` service (Phase 2). The React frontend:

- Consumes REST API endpoints from `hotel-api-rest`
- Uses Vite proxy to avoid CORS issues
- Demonstrates decoupled frontend/backend architecture
- Shows how modern React can integrate with legacy Java EE backends

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [hotel-api-rest Docker Setup](../hotel-api-rest/docs/DOCKER_SETUP.md)

## Support

For issues specific to this setup, check:
- Container logs: `docker compose logs hotel-ui-react`
- Vite dev server logs: Check container output
- Backend connectivity: Verify `hotel-api-rest` is running and healthy
- Volume mount issues: See troubleshooting section above

