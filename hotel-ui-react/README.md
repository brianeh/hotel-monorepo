# Decoupled Frontend for Legacy Java EE Hotel System (React + Vite + REST)

This project demonstrates how a modern React frontend can be fully decoupled from a classic 3‑tier Java EE stack (JSP, Servlet, EJB, MySQL) by consuming a newer RESTful API. It provides a full-featured Single Page Application (SPA) for hotel room reservations with both a user-facing booking interface and an administrative API test interface. The application uses React Router for navigation and relative URLs with a Vite proxy to avoid CORS and environment coupling.

[![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![image](https://img.shields.io/badge/React-^18.2.0-blue?logo=react&logoColor=61DAFB)
![image](https://img.shields.io/badge/Typescript-^5.0.0-blue?logo=typescript&logoColor=61DAFB)




> Note: This repository is part of the Hotel Modernization umbrella project: [hotel-modernization](https://github.com/brianeh/hotel-modernization).

## Modernization Plan

This project is phase 3 in a multi-step demonstration that highlights a few different paths available for the modernization of a legacy web application.

### Project Plan:

Phase 1: [hotel-monolith](https://www.github.com/brianeh/hotel-monolith) (Legacy application running in a devcontainer)

Phase 2: [hotel-demo-restful](https://www.github.com/brianeh/hotel-demo-restful) (New REST API on top of existing persistence layer)

Phase 3: [hotel-demo-react](https://www.github.com/brianeh/hotel-demo-react) (Decoupled user interface - this project)

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

- Node.js 20+ (provided via DevContainer)
- Backend running at `http://localhost:8080`
  - Hotel Reservation Demo - Phase 2 (**RESTful API**) - [hotel-demo-restful](https://www.github.com/brianeh/hotel-demo-restful)
- The Vite dev server is configured to proxy API requests to the backend

## Quick Start

### Using DevContainer (Recommended)

1. Open the project in VS Code/Cursor
2. Select "Reopen in Container" when prompted
3. Wait for npm install to complete
4. Start the dev server:

```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

### Without DevContainer

```bash
cd hotel-demo-react
npm install
npm run dev
```

**Note**: The Vite dev server automatically proxies API requests to the backend. No additional configuration needed.

## Project Structure

```
hotel-demo-react/
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

**Architecture**: The app uses relative URLs (`/api/*`) which are proxied by the Vite dev server to the backend at `http://host.docker.internal:8080/HotelReservation-war`. This eliminates CORS issues and simplifies browser configuration.

### How the Proxy Works

When running in the DevContainer, the architecture works as follows:

1. **Browser** makes request to `http://localhost:5173/api/rooms`
2. **Vite dev server** (running in container) receives the request
3. **Vite proxy** forwards it to `http://host.docker.internal:8080/HotelReservation-war/api/rooms`
4. **Backend API** processes the request and returns data
5. **Response** flows back through the same path

This setup prevents CORS issues because the browser only talks to the Vite dev server (same origin), while the actual backend call is made by the Node.js process inside the container where `host.docker.internal` resolves correctly.

## Environment Variables

The project uses Vite's proxy configuration (see `vite.config.ts`) to handle API requests. The DevContainer automatically sets `VITE_API_URL` to `http://host.docker.internal:8080/HotelReservation-war`.

**Development**: No `.env` file needed - the Vite proxy handles all API routing automatically.

**Production**: Create `.env.production`:

```
VITE_API_URL=https://api.yourdomain.com/HotelReservation-war
```

## Development Workflow

### Start Backend (Terminal 1)

```bash
cd ../hotel-demo-restful
./status.sh    # Check services
./deploy.sh    # Deploy backend
```

### Start Frontend (Terminal 2)

```bash
cd hotel-demo-react
npm run dev    # Start Vite dev server
```

### Access

- Frontend: http://localhost:5173
- Backend API (via proxy): http://localhost:5173/api/\*
- Backend API (direct): http://localhost:8080/HotelReservation-war/api

## Scripts

- `npm run dev` - Start development server on port 5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Troubleshooting

### Cannot connect to backend

1. Verify backend is running: `curl http://localhost:8080/HotelReservation-war/api/rooms`
2. Check Vite dev server is running: `npm run dev`
3. Test the proxy: `curl http://localhost:5173/api/rooms` (should return room data)
4. For DevContainer: the proxy is configured in `vite.config.ts` to use `host.docker.internal` to access host services

### CORS errors

CORS should not be an issue as the Vite dev server acts as a proxy. All API requests go through the Vite dev server, which makes the backend requests from within the container.

If you still encounter CORS errors, ensure the backend allows requests from `http://localhost:5173` in the backend's `web.xml` configuration.

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
