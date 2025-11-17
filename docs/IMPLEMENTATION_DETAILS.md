# Implementation Details - Hotel Reservation System

Comprehensive technical documentation for the implemented phases of the Hotel Reservation System modernization project. This document covers database schema, API specifications, React architecture, build configurations, and deployment details.

**Document Purpose:** This document provides detailed technical reference for developers working on the implemented phases (1-3). It includes complete HTTP API examples, code structure, build commands, and Docker Compose workflows. For phase planning and architecture decisions, see [MODERNIZATION_ROADMAP.md](./MODERNIZATION_ROADMAP.md) and [DECISION_FRAMEWORK.md](./DECISION_FRAMEWORK.md).

---

## Table of Contents

1. [Database Schema](#database-schema)
2. [REST API Specifications](#rest-api-specifications)
3. [React Component Architecture](#react-component-architecture)
4. [Build and Deployment](#build-and-deployment)
5. [Development Workflow](#development-workflow)

---

## Database Schema

### Overview

The system uses MySQL 8.0 with two main tables: `room` and `reservation`. The schema is shared across all three phases (hotel-monolith, hotel-api-rest, hotel-ui-react).

**Note:** Phase 3.5 (`hotel-db-postgres`) provides a PostgreSQL 15 option with equivalent schema. PostgreSQL uses `has_private_bathroom` (vs MySQL's `have_private_bathroom`) and `SERIAL` primary keys (vs MySQL's `AUTO_INCREMENT`).

### Room Table

**Table Name:** `room`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique room identifier |
| `description` | TEXT | | Room description and amenities |
| `number_of_person` | INT | | Maximum occupancy |
| `have_private_bathroom` | BOOLEAN | | Whether room has private bathroom |
| `price` | REAL | | Room price per night |

**Sample Data:**
```sql
INSERT INTO room (description, number_of_person, have_private_bathroom, price) VALUES
('Standard Single Room - Cozy room with city view', 1, TRUE, 75.00),
('Standard Double Room - Comfortable room with queen bed', 2, TRUE, 120.00),
('Deluxe Suite - Spacious suite with king bed and living area', 2, TRUE, 250.00);
```

### Reservation Table

**Table Name:** `reservation`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique reservation identifier |
| `id_room` | INT | NOT NULL, FK → room.id | Reference to reserved room |
| `check_in_date` | DATE | | Check-in date |
| `check_out_date` | DATE | | Check-out date |
| `full_name` | VARCHAR(25) | | Customer full name |
| `email` | VARCHAR(25) | | Customer email address |
| `phone` | VARCHAR(20) | | Customer phone number |
| `special_request` | TEXT | NULL | Optional special requests |

**Sample Data:**
```sql
INSERT INTO reservation (id_room, check_in_date, check_out_date, full_name, email, phone, special_request) VALUES
(1, '2025-10-25', '2025-10-27', 'John Smith', 'john.smith@email.com', '+1-555-0101', 'Late check-in requested');
```

### Entity Relationship

```
room (1) ────< (many) reservation
```

- One room can have many reservations
- Each reservation references exactly one room
- Date conflict checking ensures no overlapping reservations for the same room

---

## REST API Specifications

### Base URL

**Development:** `http://localhost:8080/HotelReservation-war/api`  
**Production:** `https://api.yourdomain.com/HotelReservation-war/api`

### Content Types

All endpoints support:
- `application/json` (default)
- `application/xml`

### Room Endpoints

#### GET /api/rooms

List all rooms in the system.

**Request:**
```http
GET /api/rooms HTTP/1.1
Host: localhost:8080
Accept: application/json
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": 1,
    "description": "Standard Single Room - Cozy room with city view",
    "numberOfPerson": 1,
    "havePrivateBathroom": true,
    "price": 75.0
  },
  {
    "id": 2,
    "description": "Standard Double Room - Comfortable room with queen bed",
    "numberOfPerson": 2,
    "havePrivateBathroom": true,
    "price": 120.0
  }
]
```

#### GET /api/rooms/{id}

Get a specific room by ID.

**Request:**
```http
GET /api/rooms/1 HTTP/1.1
Host: localhost:8080
Accept: application/json
```

**Response (Success):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "description": "Standard Single Room - Cozy room with city view",
  "numberOfPerson": 1,
  "havePrivateBathroom": true,
  "price": 75.0
}
```

**Response (Not Found):**
```http
HTTP/1.1 404 Not Found
```

#### POST /api/rooms

Create a new room.

**Request:**
```http
POST /api/rooms HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "description": "Luxury Suite - Premium suite with ocean view",
  "numberOfPerson": 3,
  "havePrivateBathroom": true,
  "price": 400.0
}
```

**Response:**
```http
HTTP/1.1 201 Created
Location: /api/rooms/11
Content-Type: application/json

{
  "id": 11,
  "description": "Luxury Suite - Premium suite with ocean view",
  "numberOfPerson": 3,
  "havePrivateBathroom": true,
  "price": 400.0
}
```

#### PUT /api/rooms/{id}

Update an existing room.

**Request:**
```http
PUT /api/rooms/1 HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "id": 1,
  "description": "Standard Single Room - Updated description",
  "numberOfPerson": 1,
  "havePrivateBathroom": true,
  "price": 80.0
}
```

**Response:**
```http
HTTP/1.1 200 OK
```

#### DELETE /api/rooms/{id}

Delete a room.

**Request:**
```http
DELETE /api/rooms/1 HTTP/1.1
Host: localhost:8080
```

**Response:**
```http
HTTP/1.1 204 No Content
```

### Reservation Endpoints

#### GET /api/reservations

List all reservations.

**Request:**
```http
GET /api/reservations HTTP/1.1
Host: localhost:8080
Accept: application/json
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": 1,
    "idRoom": 1,
    "checkInDate": "2025-10-25",
    "checkOutDate": "2025-10-27",
    "fullName": "John Smith",
    "email": "john.smith@email.com",
    "phone": "+1-555-0101",
    "specialRequest": "Late check-in requested"
  }
]
```

#### GET /api/reservations/{id}

Get a specific reservation by ID.

**Request:**
```http
GET /api/reservations/1 HTTP/1.1
Host: localhost:8080
Accept: application/json
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "idRoom": 1,
  "checkInDate": "2025-10-25",
  "checkOutDate": "2025-10-27",
  "fullName": "John Smith",
  "email": "john.smith@email.com",
  "phone": "+1-555-0101",
  "specialRequest": "Late check-in requested"
}
```

#### GET /api/reservations/search

Search for available rooms by date range.

**Request:**
```http
GET /api/reservations/search?checkIn=2025-11-01&checkOut=2025-11-05 HTTP/1.1
Host: localhost:8080
Accept: application/json
```

**Query Parameters:**
- `checkIn` (required): Check-in date in `YYYY-MM-DD` format
- `checkOut` (required): Check-out date in `YYYY-MM-DD` format

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": 2,
    "description": "Standard Double Room - Comfortable room with queen bed",
    "numberOfPerson": 2,
    "havePrivateBathroom": true,
    "price": 120.0
  },
  {
    "id": 4,
    "description": "Family Room - Large room with two double beds",
    "numberOfPerson": 4,
    "havePrivateBathroom": true,
    "price": 180.0
  }
]
```

**Error Response (Invalid Date Format):**
```http
HTTP/1.1 400 Bad Request

Invalid data format. Use yyyy-MM-dd
```

#### POST /api/reservations

Create a new reservation.

**Request:**
```http
POST /api/reservations HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "idRoom": 2,
  "checkInDate": "2025-11-10",
  "checkOutDate": "2025-11-12",
  "fullName": "Jane Doe",
  "email": "jane.doe@email.com",
  "phone": "+1-555-0202",
  "specialRequest": "Early check-in preferred"
}
```

**Response:**
```http
HTTP/1.1 201 Created
Location: /api/reservations/9
Content-Type: application/json

{
  "id": 9,
  "idRoom": 2,
  "checkInDate": "2025-11-10",
  "checkOutDate": "2025-11-12",
  "fullName": "Jane Doe",
  "email": "jane.doe@email.com",
  "phone": "+1-555-0202",
  "specialRequest": "Early check-in preferred"
}
```

#### PUT /api/reservations/{id}

Update an existing reservation.

**Request:**
```http
PUT /api/reservations/1 HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "id": 1,
  "idRoom": 1,
  "checkInDate": "2025-10-25",
  "checkOutDate": "2025-10-28",
  "fullName": "John Smith",
  "email": "john.smith@email.com",
  "phone": "+1-555-0101",
  "specialRequest": "Updated request"
}
```

**Response:**
```http
HTTP/1.1 200 OK
```

#### DELETE /api/reservations/{id}

Cancel a reservation.

**Request:**
```http
DELETE /api/reservations/1 HTTP/1.1
Host: localhost:8080
```

**Response:**
```http
HTTP/1.1 204 No Content
```

### Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Successful GET, PUT operations
- `201 Created` - Successful POST operations
- `204 No Content` - Successful DELETE operations
- `400 Bad Request` - Invalid request data or parameters
- `404 Not Found` - Resource not found

---

## React Component Architecture

### Project Structure

```
hotel-ui-react/
├── src/
│   ├── components/
│   │   ├── HomePage.tsx              # Landing page with date selection
│   │   ├── HomePage.module.css
│   │   ├── ExplorePage.tsx           # Hotel amenities showcase
│   │   ├── ExplorePage.module.css
│   │   ├── ContactPage.tsx           # Contact information
│   │   ├── ContactPage.module.css
│   │   ├── AvailableRoomsPage.tsx   # Room listing with search results
│   │   ├── AvailableRoomsPage.module.css
│   │   ├── ReservationPage.tsx       # Booking form
│   │   ├── ReservationPage.module.css
│   │   ├── ApiTestPage.tsx           # Administrative API testing
│   │   ├── layout/
│   │   │   ├── SiteLayout.tsx        # Main layout wrapper
│   │   │   └── SiteLayout.module.css
│   │   ├── ui/
│   │   │   ├── Button.tsx            # Reusable button component
│   │   │   ├── Button.module.css
│   │   │   ├── Container.tsx        # Page container
│   │   │   ├── Container.module.css
│   │   │   ├── FormField.tsx         # Form input wrapper
│   │   │   ├── FormField.module.css
│   │   │   ├── ImageTile.tsx          # Image display component
│   │   │   ├── ImageTile.module.css
│   │   │   ├── SectionHeader.tsx     # Section title
│   │   │   └── SectionHeader.module.css
│   │   └── common/
│   │       ├── SearchForm.tsx        # Reusable date search form
│   │       └── SearchForm.module.css
│   ├── services/
│   │   └── api-client.ts             # REST API client functions
│   ├── types/
│   │   ├── room.ts                   # Room TypeScript interface
│   │   └── reservation.ts            # Reservation TypeScript interface
│   ├── App.tsx                       # Root component with routing
│   └── main.tsx                      # Application entry point
├── public/
│   └── images/                       # Static assets
├── vite.config.ts                    # Vite configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies and scripts
```

### Component Hierarchy

```
App (React Router)
└── SiteLayout
    ├── Navigation (mobile/desktop)
    └── Page Content
        ├── HomePage
        │   └── SearchForm
        ├── ExplorePage
        │   └── ImageTile (multiple)
        ├── ContactPage
        ├── AvailableRoomsPage
        │   └── Room Cards
        ├── ReservationPage
        │   └── FormField (multiple)
        └── ApiTestPage
            └── API Test Forms
```

### TypeScript Interfaces

#### Room Interface

```typescript
// src/types/room.ts
export interface Room {
  id: number;
  description: string;
  numberOfPerson: number;
  havePrivateBathroom: boolean;
  price: number;
}
```

#### Reservation Interface

```typescript
// src/types/reservation.ts
export interface Reservation {
  id?: number;
  idRoom: number;
  checkInDate: string;  // ISO date string (YYYY-MM-DD)
  checkOutDate: string; // ISO date string (YYYY-MM-DD)
  fullName: string;
  email: string;
  phone: string;
  specialRequest?: string;
}
```

### API Client Functions

```typescript
// src/services/api-client.ts

// Room operations
getAllRooms(): Promise<Room[]>
getRoomById(id: number): Promise<Room>
createRoom(room: Partial<Room>): Promise<Room>
updateRoom(id: number, room: Partial<Room>): Promise<void>
deleteRoom(id: number): Promise<void>

// Reservation operations
getAllReservations(): Promise<Reservation[]>
getReservationById(id: number): Promise<Reservation>  // Implied by API endpoint
searchAvailableRooms(checkIn: string, checkOut: string): Promise<Room[]>
createReservation(reservation: Reservation): Promise<Reservation>
updateReservation(id: number, reservation: Reservation): Promise<void>
deleteReservation(id: number): Promise<void>
```

### Routing Configuration

```typescript
// src/App.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/explore" element={<ExplorePage />} />
  <Route path="/contact" element={<ContactPage />} />
  <Route path="/api-test" element={<ApiTestPage />} />
  <Route path="/available-rooms" element={<AvailableRoomsPage />} />
  <Route path="/reservation" element={<ReservationPage />} />
</Routes>
```

### Responsive Design Breakpoints

- **Mobile:** ≤768px
  - Hamburger menu navigation
  - Stacked form layouts
  - Single column room listings
- **Tablet:** ≥900px
  - Two-column layouts for Contact/Explore pages
  - Multi-column feature grids
- **Desktop:** ≥1024px
  - Maximum container width (1100px)
  - Full navigation menu
  - Optimized spacing and padding

---

## Build and Deployment

### Phase 1: hotel-monolith

**Build Tool:** Apache Ant

**Build Command:**
```bash
ant clean dist
```

**Build Output:**
- `dist/HotelReservation.ear` - Enterprise Archive containing:
  - `HotelReservation-ejb.jar` - EJB module
  - `HotelReservation-war.war` - Web module

**Deployment:**
```bash
./deploy.sh  # Builds and deploys to GlassFish
```

**Deployment Structure:**
```
GlassFish 4.1.1
└── domains/domain1/autodeploy/
    └── HotelReservation.ear
        ├── HotelReservation-ejb.jar
        └── HotelReservation-war.war
```

### Phase 2: hotel-api-rest

**Build Tool:** Apache Ant (same as Phase 1)

**Additional Dependencies:**
- Jackson libraries in `WEB-INF/lib/`:
  - `jackson-core-*.jar`
  - `jackson-databind-*.jar`
  - `jackson-annotations-*.jar`

**Build Command:**
```bash
ant clean dist
```

**Deployment:**
```bash
./deploy.sh  # Builds and deploys to GlassFish
```

**REST API Configuration:**
- `ApplicationConfig.java` with `@ApplicationPath("api")`
- JAX-RS automatically discovered by GlassFish
- Jackson JSON provider configured via application properties

### Phase 3: hotel-ui-react

**Build Tool:** Vite 5.0.0

**Development:**
```bash
npm install
npm run dev  # Starts Vite dev server on port 5173
```

**Production Build:**
```bash
npm run build  # Creates optimized production bundle in dist/
```

**Build Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [image assets]
```

**Vite Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: "0.0.0.0", // Allow access from outside container
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://hotel-api-rest:8080/HotelReservation-war",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
```

**Production Deployment (Planned):**
- Frontend: S3 + CloudFront
- Backend: EC2/ECS with GlassFish
- Environment variable: `VITE_API_URL` for production API endpoint

---

## Development Workflow

All phases use Docker Compose orchestration from the monorepo root. Services are managed via profiles and share a common network.

### Phase 1: Legacy Monolith

**Start Service:**
```bash
# From monorepo root
docker compose --profile monolith up -d

# View logs
docker compose logs -f hotel-monolith
```

**Access Points:**
- Web Application: http://localhost:8080/HotelReservation-war/
- Admin Console: http://localhost:4849
- MySQL: localhost:3307 (user: `root`, password: `root`)

**Development Cycle:**
1. Edit Java source files in `hotel-monolith/HotelReservation-ejb/src/java/` or `hotel-monolith/HotelReservation-war/src/java/`
2. Exec into container and build:
   ```bash
   docker compose exec hotel-monolith bash
   cd /workspaces/hotel-modernization/hotel-monolith
   ant clean dist
   ./deploy.sh
   ```
3. Access application at `http://localhost:8080/HotelReservation-war/`

**Database:**
- Automatically initialized on first startup
- Schema located in `hotel-monolith/database/sql_queries.sql`

### Phase 2: RESTful API

**Start Service:**
```bash
# From monorepo root
docker compose --profile api up -d

# View logs
docker compose logs -f hotel-api-rest
```

**Access Points:**
- Web Application: http://localhost:8080/HotelReservation-war/
- REST API: http://localhost:8080/HotelReservation-war/api/rooms
- Admin Console: http://localhost:4850
- MySQL: localhost:3308 (user: `root`, password: `root`)

**Development Cycle:**
1. Edit Java source files in `hotel-api-rest/HotelReservation-ejb/src/java/` or `hotel-api-rest/HotelReservation-war/src/java/`
2. Exec into container and build:
   ```bash
   docker compose exec hotel-api-rest bash
   cd /workspaces/hotel-modernization/hotel-api-rest
   ant clean dist
   ./deploy.sh
   ```
3. Test API at `http://localhost:8080/HotelReservation-war/api/rooms`

**Database:**
- Automatically initialized on first startup
- Schema located in `hotel-api-rest/database/sql_queries.sql`

### Phase 3: React Frontend

**Prerequisites:**
- Phase 2 (hotel-api-rest) must be running

**Start Services:**
```bash
# From monorepo root - start API backend first
docker compose --profile api up -d

# Start React frontend
docker compose --profile ui up -d

# View logs
docker compose logs -f hotel-ui-react
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API (via proxy): http://localhost:5173/api/rooms
- Backend API (direct): http://localhost:8080/HotelReservation-war/api/rooms

**Development Cycle:**
1. Edit React components in `hotel-ui-react/src/components/`
2. Changes automatically reload via Vite HMR (no rebuild needed)
3. API requests are proxied to `hotel-api-rest` service via Docker network
4. Access application at `http://localhost:5173`

**Testing API Integration:**
- Use `ApiTestPage` component at `/api-test` route
- Or use browser DevTools Network tab
- Or test backend directly: `curl http://localhost:8080/HotelReservation-war/api/rooms`

### Full Stack Development

**Start All Services:**
```bash
# From monorepo root
docker compose --profile api --profile ui up -d

# Or start all services
docker compose --profile all up -d
```

**View Logs:**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f hotel-api-rest
docker compose logs -f hotel-ui-react
```

**Stop Services:**
```bash
# Stop specific service
docker compose stop hotel-api-rest

# Stop all services
docker compose --profile all down
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/HotelReservation-war/api/rooms
- Backend UI (JSP): http://localhost:8080/HotelReservation-war/
- Admin Console (API): http://localhost:4850

### Phase 3.5: PostgreSQL Database

**Start Database Service:**
```bash
# From monorepo root
docker compose --profile db up -d

# View logs
docker compose logs -f hotel-db-postgres
```

**Access Points:**
- PostgreSQL: localhost:5432
- Database: `hotel_reservation`
- User: `postgres`
- Password: `postgres`

**Connect to Database:**
```bash
# From host
docker compose exec hotel-db-postgres psql -U postgres -d hotel_reservation

# Or from another container on the network
psql -h hotel-postgres-standalone -U postgres -d hotel_reservation
```

**Schema:**
- Automatically initialized from `hotel-db-postgres/schema/` on first startup
- Uses PostgreSQL 15 with equivalent schema to MySQL version

### Docker Compose Benefits

- **Consistent Environment**: All services run in isolated containers
- **Service Discovery**: Services communicate via Docker network (e.g., `hotel-api-rest:8080`)
- **Profile-Based Management**: Start only the services you need
- **Volume Persistence**: Database and application data persist across restarts
- **Easy Scaling**: Start/stop services independently
- **Network Isolation**: Services communicate securely on `hotel-shared-network`

---

## Summary

This implementation demonstrates a progressive modernization approach:

1. **Phase 1 (hotel-monolith):** Traditional Java EE monolith with JSP/Servlet frontend
2. **Phase 2 (hotel-api-rest):** REST API layer added without disrupting existing functionality
3. **Phase 3 (hotel-ui-react):** Modern React SPA consuming REST API, fully decoupled from backend

Each phase builds on the previous one, allowing incremental modernization with minimal risk and maximum flexibility.

