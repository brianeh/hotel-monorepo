# Decoupled Frontend for Legacy Java EE Hotel System (React + Vite + REST)

This project demonstrates how a modern React frontend can be fully decoupled from a classic 3‑tier Java EE stack (JSP, Servlet, EJB, MySQL) by consuming a newer RESTful API. It provides a full-featured Single Page Application (SPA) for hotel room reservations with both a user-facing booking interface and an administrative API test interface. The application uses React Router for navigation and relative URLs with a Vite proxy to avoid CORS and environment coupling.

[![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![image](https://img.shields.io/badge/React-^18.2.0-blue?logo=react&logoColor=61DAFB)
![image](https://img.shields.io/badge/Typescript-^5.0.0-blue?logo=typescript&logoColor=61DAFB)




> Note: This repository is part of the Hotel Modernization umbrella project: [hotel-modernization](https://github.com/brianeh/hotel-modernization).

## Modernization Plan

This project is phase 3 in a multi-step demonstration that highlights a few different paths available for the modernization of a legacy web application.

### Project Plan:

Phase 1: [hotel-monolith](https://github.com/brianeh/hotel-modernization/tree/main/hotel-monolith) (Legacy application running in a devcontainer)

Phase 2: [hotel-api-rest](https://github.com/brianeh/hotel-modernization/tree/main/hotel-api-rest) (New REST API on top of existing persistence layer)

Phase 3: [hotel-ui-react](https://github.com/brianeh/hotel-modernization/tree/main/hotel-ui-react) (Decoupled user interface - this project)

## Overview

This is a full-featured React Single Page Application (SPA) for hotel room reservations. The application provides:

### User-Facing Features

1. **Home Page** - Welcome page with date selection for check-in and check-out dates
2. **Room Search** - Search for available rooms between selected dates
3. **Explore** - Browse hotel amenities and facilities
4. **Contact** - Contact information and hotel details
5. **Available Rooms** - Display and browse available rooms with details and pricing
6. **Reservation** - Complete reservation booking flow with customer information

### Administrative Features

7. **API Test Page** - Comprehensive test interface for all REST API endpoints:
   - Get All Rooms - Fetch and display all available rooms
   - Get Room by ID - Fetch details of a specific room
   - Search Available Rooms - Search for rooms available between check-in and check-out dates
   - Create Reservation - Create a new hotel reservation
   - Get All Reservations - View all existing reservations
   - Create New Room - Add a new room to the system
   - Update Room - Modify an existing room's details
   - Delete Room - Remove a room from the system

## Prerequisites

- **Docker Compose** (for Docker Compose workflow) OR **Node.js 20+** (for DevContainer or manual setup)
- Backend running at `http://localhost:8080` (can be started via docker-compose or separately)
  - Hotel Reservation Demo - Phase 2 (**RESTful API**) - [hotel-api-rest](https://github.com/brianeh/hotel-modernization/tree/main/hotel-api-rest)
- The Vite dev server is configured to proxy API requests to the backend

## Quick Start

This project supports multiple development workflows. Choose the one that best fits your needs:

### Option 1: Docker Compose (Recommended for Monorepo Workflows)

**Best for**: Full-stack development, testing service integration, working with other services in the monorepo

The root `docker-compose.yml` orchestrates all services on a shared network. This is the recommended approach when working with the entire hotel-modernization monorepo.

#### Prerequisites
- Docker Desktop installed and running
- Git (to clone the repository)

#### Setup Steps:

1. **Navigate to the monorepo root** (if you haven't already):
   ```bash
   cd hotel-modernization
   ```

2. **Start the UI and API services together**:
   ```bash
   docker compose --profile ui up
   ```
   
   This will start both `hotel-api-rest` and `hotel-ui-react` services. The UI service will automatically wait for the API service to be healthy before starting.

3. **Or start all services**:
   ```bash
   docker compose --profile all up
   ```

4. **Wait for services to start** (~2-3 minutes for initial setup):
   ```bash
   docker compose logs -f hotel-ui-react
   ```
   Press `Ctrl+C` to exit log view once services are ready.

5. **Access the application**:
   - **Frontend Application**: http://localhost:5173
   - **Backend API** (via proxy): http://localhost:5173/api/*
   - **Backend API** (direct): http://localhost:8080/HotelReservation-war/api

#### Service Management:

```bash
# View logs
docker compose logs -f hotel-ui-react

# Stop the service
docker compose stop hotel-ui-react

# Stop and remove containers
docker compose --profile ui down

# Start in detached mode
docker compose --profile ui up -d
```

**Note**: The container automatically installs dependencies and starts the Vite dev server. The `VITE_API_URL` environment variable is automatically set to `http://hotel-api-rest:8080/HotelReservation-war` for service-to-service communication within the Docker network.

---

### Option 2: DevContainer (For Focused Development)

**Best for**: Focused development on this service only, independent development cycles, when you don't need other monorepo services

1. Open the project in VS Code/Cursor
2. Select "Reopen in Container" when prompted
3. Wait for npm install to complete
4. Start the dev server:

```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

**Note**: The Vite dev server automatically proxies API requests to the backend. The DevContainer configuration sets `VITE_API_URL` to `http://host.docker.internal:8080/HotelReservation-war` to access services running on the host machine.

---

### Option 3: Manual Setup (Without Containers)

**Best for**: Local development without Docker, when you have Node.js installed locally

```bash
cd hotel-ui-react
npm install
npm run dev
```

**Note**: Ensure the backend is running at `http://localhost:8080` before starting the frontend. The Vite dev server automatically proxies API requests to the backend.

## Project Structure

```
hotel-ui-react/
├── src/
│   ├── components/
│   │   ├── HomePage.tsx              # Home page with date selection
│   │   ├── HomePage.module.css
│   │   ├── ExplorePage.tsx           # Hotel amenities and facilities
│   │   ├── ExplorePage.module.css
│   │   ├── ContactPage.tsx           # Contact information
│   │   ├── ContactPage.module.css
│   │   ├── AvailableRoomsPage.tsx    # Available rooms listing
│   │   ├── AvailableRoomsPage.module.css
│   │   ├── ReservationPage.tsx       # Reservation booking form
│   │   ├── ReservationPage.module.css
│   │   ├── ApiTestPage.tsx           # API test interface
│   │   ├── layout/
│   │   │   ├── SiteLayout.tsx        # Site layout wrapper
│   │   │   └── SiteLayout.module.css
│   │   ├── ui/
│   │   │   ├── Button.tsx            # Reusable button component
│   │   │   ├── Button.module.css
│   │   │   ├── Container.tsx         # Container component
│   │   │   ├── Container.module.css
│   │   │   ├── FormField.tsx         # Form field component
│   │   │   ├── FormField.module.css
│   │   │   ├── ImageTile.tsx         # Image tile component
│   │   │   ├── ImageTile.module.css
│   │   │   ├── SectionHeader.tsx     # Section header component
│   │   │   └── SectionHeader.module.css
│   │   └── common/
│   │       ├── SearchForm.tsx        # Reusable search form
│   │       └── SearchForm.module.css
│   ├── services/
│   │   └── api-client.ts              # API client functions (uses relative URLs)
│   ├── types/
│   │   ├── room.ts                   # Room TypeScript interface
│   │   └── reservation.ts            # Reservation TypeScript interface
│   ├── App.tsx                       # Root component with React Router
│   └── main.tsx                      # Entry point
├── .devcontainer/
│   └── devcontainer.json             # DevContainer configuration with VITE_API_URL
├── public/
│   └── images/                       # Static images (banner, hotel photos)
├── package.json
├── tsconfig.json
├── vite.config.ts                    # Configured with API proxy to backend
└── index.html
```

## Responsive Design

The application is built with a mobile-first responsive design approach, ensuring optimal user experience across all device sizes from mobile phones to large desktop screens. The responsive design uses CSS Grid and Flexbox layouts that adapt seamlessly based on viewport width.

### Breakpoints

The application uses the following breakpoints for responsive behavior:

- **768px (max-width)**: Mobile breakpoint
  - Navigation switches to hamburger menu
  - Home page date form stacks vertically
  - Padding and spacing optimized for smaller screens
- **900px (min-width)**: Tablet/Desktop breakpoint

  - Contact and Explore pages switch from single to two-column layouts
  - Feature grids display in multiple columns

- **1024px (min-width)**: Large Desktop breakpoint
  - Container components expand to maximum width (1100px)

### Key Responsive Features

- **Mobile Navigation**:

  - Hamburger menu icon appears on screens ≤768px
  - Slide-in mobile menu with backdrop overlay
  - Smooth animations and transitions

- **Flexible Grid Layouts**:

  - Date selection form adapts from multi-column to single column on mobile
  - Room listings use CSS Grid with `auto-fit` and `minmax()` for automatic column adjustment
  - Contact and Explore pages transition from single to two-column layouts

- **Responsive Forms**:

  - Form fields and inputs resize appropriately
  - Buttons expand to full width on mobile for easier touch interaction
  - Date inputs maintain usability across screen sizes

- **Viewport Configuration**:

  - Proper viewport meta tag configured in `index.html` for correct scaling
  - Ensures proper rendering on mobile devices without horizontal scrolling

- **Adaptive Spacing**:
  - Padding and margins adjust based on screen size
  - Hero sections optimize content spacing for mobile and desktop

### Screenshots

---

**Desktop View**

<img src="docs/images/desktop-view.png" alt="Desktop view" style="max-width: 600px;">

---

**Mobile View**

<img src="docs/images/mobile-view.png" alt="Mobile view" style="max-width: 300px;">

## API Endpoints Used

The application uses the following REST API endpoints throughout its user-facing pages and administrative interface:

### Room Endpoints

- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/{id}` - Get specific room by ID
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/{id}` - Update room
- `DELETE /api/rooms/{id}` - Delete room

### Reservation Endpoints

- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/search?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD` - Search available rooms
- `POST /api/reservations` - Create new reservation

**Architecture**: The app uses relative URLs (`/api/*`) which are proxied by the Vite dev server to the backend. The proxy target depends on the deployment method (Docker Compose vs DevContainer). This eliminates CORS issues and simplifies browser configuration.

### How the Proxy Works

The proxy configuration varies depending on how you're running the application:

#### Scenario 1: Docker Compose (Service-to-Service Communication)

When running via Docker Compose, services communicate using Docker service names on a shared network:

1. **Browser** makes request to `http://localhost:5173/api/rooms`
2. **Vite dev server** (running in `hotel-ui-react` container) receives the request
3. **Vite proxy** forwards it to `http://hotel-api-rest:8080/HotelReservation-war/api/rooms` (using Docker service name)
4. **Backend API** (running in `hotel-api-rest` container) processes the request and returns data
5. **Response** flows back through the same path

The `VITE_API_URL` environment variable is automatically set to `http://hotel-api-rest:8080/HotelReservation-war` in the docker-compose configuration, allowing service-to-service communication within the Docker network.

#### Scenario 2: DevContainer (Host Service Access)

When running in a DevContainer, the container needs to access services running on the host machine:

1. **Browser** makes request to `http://localhost:5173/api/rooms`
2. **Vite dev server** (running in container) receives the request
3. **Vite proxy** forwards it to `http://host.docker.internal:8080/HotelReservation-war/api/rooms` (accessing host services)
4. **Backend API** (running on host machine) processes the request and returns data
5. **Response** flows back through the same path

The DevContainer configuration sets `VITE_API_URL` to `http://host.docker.internal:8080/HotelReservation-war` to access services running on the host machine.

#### Why This Works

Both setups prevent CORS issues because the browser only talks to the Vite dev server (same origin), while the actual backend call is made by the Node.js process inside the container. The difference is:
- **Docker Compose**: Uses Docker service names for container-to-container communication
- **DevContainer**: Uses `host.docker.internal` to access services on the host machine

## Environment Variables

The project uses Vite's proxy configuration (see `vite.config.ts`) to handle API requests. The `VITE_API_URL` environment variable is set automatically depending on your deployment method:

### Docker Compose

When running via Docker Compose, `VITE_API_URL` is automatically set in `docker-compose.yml`:
- **Value**: `http://hotel-api-rest:8080/HotelReservation-war`
- **Purpose**: Service-to-service communication using Docker service names
- **No configuration needed** - the docker-compose file handles this automatically

### DevContainer

When running in a DevContainer, `VITE_API_URL` is set in the DevContainer configuration:
- **Value**: `http://host.docker.internal:8080/HotelReservation-war`
- **Purpose**: Access services running on the host machine
- **No configuration needed** - the DevContainer configuration handles this automatically

### Manual Setup

For local development without containers, you can optionally create a `.env` file:
```
VITE_API_URL=http://localhost:8080/HotelReservation-war
```

**Note**: If `VITE_API_URL` is not set, Vite will use the default value from `vite.config.ts` (`http://hotel-api-rest:8080/HotelReservation-war`).

### Production

For production builds, create `.env.production`:

```
VITE_API_URL=https://api.yourdomain.com/HotelReservation-war
```

## Development Workflow

### Option 1: Docker Compose (Recommended)

The easiest way to develop with the full stack is using Docker Compose, which handles service dependencies and networking automatically.

#### Start All Services

```bash
# From the monorepo root
docker compose --profile ui up
```

This starts both the API and UI services. The UI service automatically waits for the API service to be healthy.

#### View Logs

```bash
# View UI logs
docker compose logs -f hotel-ui-react

# View API logs
docker compose logs -f hotel-api-rest

# View all logs
docker compose logs -f
```

#### Stop Services

```bash
# Stop services (keeps containers)
docker compose stop

# Stop and remove containers
docker compose --profile ui down
```

#### Access Services

- **Frontend**: http://localhost:5173
- **Backend API** (via proxy): http://localhost:5173/api/*
- **Backend API** (direct): http://localhost:8080/HotelReservation-war/api

---

### Option 2: Manual Workflow (Alternative)

If you prefer to run services manually or are using DevContainer:

#### Start Backend (Terminal 1)

```bash
cd ../hotel-api-rest
./status.sh    # Check services
./deploy.sh    # Deploy backend
```

#### Start Frontend (Terminal 2)

```bash
cd hotel-ui-react
npm run dev    # Start Vite dev server
```

#### Access

- Frontend: http://localhost:5173
- Backend API (via proxy): http://localhost:5173/api/*
- Backend API (direct): http://localhost:8080/HotelReservation-war/api

## Scripts

- `npm run dev` - Start development server on port 5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Troubleshooting

### Cannot connect to backend

#### Docker Compose

1. **Check service status**:
   ```bash
   docker compose ps
   ```
   Ensure both `hotel-api-rest` and `hotel-ui-react` services are running and healthy.

2. **Check service logs**:
   ```bash
   docker compose logs hotel-api-rest
   docker compose logs hotel-ui-react
   ```

3. **Verify backend API is accessible**:
   ```bash
   curl http://localhost:8080/HotelReservation-war/api/rooms
   ```

4. **Test the proxy from within the UI container**:
   ```bash
   docker compose exec hotel-ui-react curl http://hotel-api-rest:8080/HotelReservation-war/api/rooms
   ```

5. **Test the proxy from browser**:
   ```bash
   curl http://localhost:5173/api/rooms
   ```
   This should return room data if the proxy is working correctly.

6. **Restart services**:
   ```bash
   docker compose restart hotel-ui-react
   ```

#### DevContainer

1. Verify backend is running on host: `curl http://localhost:8080/HotelReservation-war/api/rooms`
2. Check Vite dev server is running: `npm run dev`
3. Test the proxy: `curl http://localhost:5173/api/rooms` (should return room data)
4. The proxy is configured in `vite.config.ts` to use `host.docker.internal` to access host services

#### Manual Setup

1. Verify backend is running: `curl http://localhost:8080/HotelReservation-war/api/rooms`
2. Check Vite dev server is running: `npm run dev`
3. Test the proxy: `curl http://localhost:5173/api/rooms` (should return room data)

### CORS errors

CORS should not be an issue as the Vite dev server acts as a proxy. All API requests go through the Vite dev server, which makes the backend requests from within the container (Docker Compose) or from the container to the host (DevContainer).

If you still encounter CORS errors:

1. **Docker Compose**: Ensure services are on the same network (`hotel-shared-network`)
2. **DevContainer**: Ensure the backend allows requests from `http://localhost:5173` in the backend's `web.xml` configuration
3. **Manual Setup**: Check that the backend CORS configuration allows requests from `http://localhost:5173`

### Service name resolution issues (Docker Compose)

If you see errors about `hotel-api-rest` not being found:

1. **Verify services are on the same network**:
   ```bash
   docker compose exec hotel-ui-react ping hotel-api-rest
   ```

2. **Check network configuration**:
   ```bash
   docker network inspect hotel-shared-network
   ```

3. **Restart services**:
   ```bash
   docker compose down
   docker compose --profile ui up
   ```

## Next Steps

The application already includes:

- ✅ React Router for navigation (implemented)
- ✅ Component-based architecture with reusable UI components
- ✅ CSS Modules for styling
- ✅ TypeScript for type safety
- ✅ Responsive design

For further enhancements, consider:

- Implementing the site search
- Implementing authentication and authorization
- Adding form validation library (React Hook Form, Formik, etc.)
- Adding testing framework (Jest, React Testing Library, etc.)
- Implementing CI/CD pipeline
