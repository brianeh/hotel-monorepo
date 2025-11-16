# Hotel Reservation System - Documentation

## Overview

This documentation covers the **RESTful API enhancement phase** of the Hotel Reservation System. The system was originally built as a traditional Java EE web application with JSP/Servlet architecture and has been enhanced with a comprehensive REST API to support modern client applications and integrations.

## What Was Added in the RESTful Phase

This phase introduced a complete RESTful API layer to the existing hotel reservation system:

- **JAX-RS REST API Implementation** - Full CRUD operations for rooms and reservations
- **Room Management Endpoints** - Create, read, update, and delete hotel rooms
- **Reservation Endpoints** - Manage bookings with date-based availability search
- **Jackson JSON Serialization** - Configured to use Jackson instead of MOXy for reliable JSON handling
- **Interactive API Test Page** - Browser-based testing interface at `/rest-test.html`
- **CDI Integration** - Proper EJB injection support for REST resources
- **Content Negotiation** - Support for both JSON and XML response formats

The REST API coexists with the original web interface, providing flexibility for different client types while reusing all existing business logic through EJB facades.

## Documentation Index

### Getting Started

- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup guide to get the application running
- **[SETUP.md](SETUP.md)** - Detailed installation and configuration instructions
- **[BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md)** - Complete build system documentation

### Architecture & Design

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Overall system architecture and design decisions
- **[ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)** - Visual architecture diagrams
- **[api/MODULES_AND_REST_API.md](api/MODULES_AND_REST_API.md)** - Comprehensive REST API documentation
  - Module architecture (EAR, EJB, WAR)
  - Complete endpoint reference
  - Request/response examples
  - API testing guide

### Configuration

- **[JACKSON_CONFIGURATION.md](JACKSON_CONFIGURATION.md)** - Jackson JSON provider setup
  - Why MOXy was replaced with Jackson
  - Required configuration changes
  - Troubleshooting ClassNotFoundException issues

### Migration & Planning

- **[MIGRATION_PLAN.md](MIGRATION_PLAN.md)** - RESTful migration strategy and implementation plan

## Quick Links

### REST API Endpoints

**Base URL:** `http://localhost:8080/HotelReservation-war/api`

#### Room Endpoints
- `GET /api/rooms` - List all rooms
- `GET /api/rooms/{id}` - Get specific room details
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/{id}` - Update room
- `DELETE /api/rooms/{id}` - Delete room

#### Reservation Endpoints
- `GET /api/reservations` - List all reservations
- `GET /api/reservations/{id}` - Get specific reservation
- `GET /api/reservations/search?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD` - Search available rooms
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/{id}` - Update reservation
- `DELETE /api/reservations/{id}` - Cancel reservation

### Testing

**Interactive Test Page:** `http://localhost:8080/HotelReservation-war/rest-test.html`

A browser-based interface for testing all REST endpoints with visual feedback, pre-filled forms, and formatted JSON responses.

## Key Features

### Zero New Dependencies
The REST API uses JAX-RS (Java API for RESTful Web Services), which is already included in Java EE 7 and GlassFish 4. Only Jackson libraries were added to `WEB-INF/lib/` for improved JSON handling.

### Reuses Existing Business Logic
REST resources leverage the same EJB facades (`RoomFacade`, `ReservationFacade`) used by the original servlet-based UI, ensuring consistency and avoiding code duplication.

### Non-Disruptive
The existing JSP/Servlet web interface continues to work unchanged. Both the traditional web UI and modern REST API operate side-by-side.

### Production-Ready
- Proper error handling with appropriate HTTP status codes
- Input validation using Bean Validation annotations
- Date conflict checking for reservation availability
- Support for JSON and XML content negotiation

## Technology Stack

- **Java EE 7** - Enterprise platform
- **JAX-RS 2.0** - REST API framework
- **Jackson 2.9.10** - JSON serialization
- **EJB 3.2** - Business logic layer
- **JPA 2.1** - Data persistence
- **GlassFish 4** - Application server
- **Java 8** - Programming language

## Getting Started

For first-time setup, follow these steps:

1. Read **[SETUP.md](SETUP.md)** for environment configuration
2. Follow **[BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md)** to build the application
3. Review **[api/MODULES_AND_REST_API.md](api/MODULES_AND_REST_API.md)** for API details
4. Use the interactive test page to verify the REST API is working

For quick reference, see **[QUICKSTART.md](QUICKSTART.md)**.

