# Hotel Reservation System - Modernization & Migration Project

This portfolio is a hands-on guide to modernizing a legacy Java EE Hotel Reservation System across six progressive phases—from the original monolith to RESTful APIs, a SPA frontend, and onward to Spring Boot, Serverless, and Microservices. Each phase includes runnable code, Docker Compose orchestration, and architecture guidance to help you evaluate trade-offs and adopt the path that fits your team.

## Overview

This repository is organized into phases that can be explored independently or end-to-end. It pairs working implementations (Legacy baseline, JAX-RS REST layer, React SPA) with planning artifacts for upcoming phases (Spring Boot, Serverless, Microservices). The sample domain covers room search, availability, and reservation flows; you'll find API examples, UI pages, deployment scripts, cost/complexity comparisons, and decision frameworks to guide incremental, low-risk migrations.

---

## Modernization Plan

```
hotel-modernization/
├── hotel-monolith/             ✅ Phase 1: Legacy Java EE Baseline (Implemented)
├── hotel-api-rest/             ✅ Phase 2: RESTful API Layer (Implemented)
├── hotel-ui-react/             ✅ Phase 3: React SPA Frontend (Implemented)
├── hotel-db-postgres/          ✅ Phase 3.5: PostgreSQL Database (Implemented)
├── hotel-demo-springboot/      📋 Phase 4: Spring Boot Backend (Planned - external repo)
├── hotel-demo-serverless/      📋 Phase 5: Serverless Backend (Planned - external repo)
└── hotel-demo-microservices/   📋 Phase 6: Microservices Architecture (Planned - external repo)
```

**Note:** Phases 4-6 are planned and will be implemented in separate repositories. See [MODERNIZATION_ROADMAP.md](./docs/MODERNIZATION_ROADMAP.md) for details.

### Implemented Projects

- **hotel-monolith** - Original Java EE monolith with JSP/Servlet frontend, EJB session beans, and MySQL database
  
  > **Note:** The original legacy application `hotel-monolith` was forked from another repository and is maintained at [https://github.com/brianeh/hotel-monolith](https://github.com/brianeh/hotel-monolith). That repository contains the original legacy monolith code that is being modernized in this `hotel-modernization` demonstration project.

- **hotel-api-rest** - Enhanced monolith with JAX-RS REST API layer (Jersey) for API-first development
- **hotel-ui-react** - Modern React SPA frontend consuming REST API via Vite proxy, built with TypeScript and CSS Modules
- **hotel-db-postgres** - Standalone PostgreSQL 15 database service for multi-phase use (migration from MySQL, shared across phases)

---

## Documentation

### Strategic Planning Documents

- **[DECISION_FRAMEWORK.md](./docs/DECISION_FRAMEWORK.md)** - Guide for choosing the right modernization approach
- **[MODERNIZATION_ROADMAP.md](./docs/MODERNIZATION_ROADMAP.md)** - Complete roadmap for all phases
- **[ARCHITECTURE_COMPARISON.md](./docs/ARCHITECTURE_COMPARISON.md)** - Detailed comparison of all architectures
- **[IMPLEMENTATION_DETAILS.md](./docs/IMPLEMENTATION_DETAILS.md)** - Comprehensive technical documentation for implemented phases

---

## Phase Status

| Phase | Status | Project | Description | Technology Stack |
|-------|--------|---------|-------------|------------------|
| **Phase 1** | ✅ **Complete** | `hotel-monolith` | Legacy Java EE Application | JSP + Servlet + EJB 3.1 + MySQL 8.0 + GlassFish 4.1.1 |
| **Phase 2** | ✅ **Complete** | `hotel-api-rest` | RESTful API Layer | JAX-RS (Jersey) + Jackson + CDI + GlassFish 4.1.1 + MySQL 8.0 |
| **Phase 3** | ✅ **Complete** | `hotel-ui-react` | React SPA Frontend | React 18.2 + TypeScript 5.0 + Vite 5.0 + React Router 7.9.5 |
| **Phase 3.5** | ✅ **Complete** | `hotel-db-postgres` | PostgreSQL Database | PostgreSQL 15 (standalone service) |
| **Phase 4** | 📋 Planned | - | Spring Boot Backend | Spring Boot + PostgreSQL |
| **Phase 5** | 📋 Planned | - | Serverless Backend | AWS Lambda + DynamoDB |
| **Phase 6** | 📋 Planned | - | Microservices | Quarkus + Kubernetes |

---

## Quick Start Guides

All phases can be started using Docker Compose from the monorepo root. Services use profiles to allow independent or combined startup.

### Phase 1: Legacy Monolith (`hotel-monolith`)
```bash
# From monorepo root
docker compose --profile monolith up -d

# View logs
docker compose logs -f hotel-monolith

# Access: http://localhost:8080/HotelReservation-war/
# Admin Console: http://localhost:4849
```

**Implementation Details:**
- 3-tier architecture: JSP/Servlet → EJB Session Beans → JPA → MySQL
- Module structure: `HotelReservation-ejb` (business logic) + `HotelReservation-war` (web layer)
- Servlets: Home, AvailableRooms, FinalReservation
- EJB Facades: RoomFacade, ReservationFacade
- Database: MySQL 8.0 with `room` and `reservation` tables
- Container automatically builds, initializes database, and deploys application

### Phase 2: RESTful API (`hotel-api-rest`)
```bash
# From monorepo root
docker compose --profile api up -d

# View logs
docker compose logs -f hotel-api-rest

# Access: http://localhost:8080/HotelReservation-war/
# API: http://localhost:8080/HotelReservation-war/api/rooms
# Validate: http://localhost:8080/HotelReservation-war/rest-test.html
# Admin Console: http://localhost:4850
```

**Implementation Details:**
- JAX-RS REST API layer added to existing monolith
- REST Resources: `RoomResource`, `ReservationResource`
- Configuration: `ApplicationConfig` with `/api` path, Jackson JSON provider
- API Endpoints: Full CRUD for rooms and reservations, date-based search
- Backward compatible: Original JSP/Servlet interface still works
- Container automatically builds, initializes database, and deploys application

### Phase 3: React Frontend (`hotel-ui-react`)
```bash
# From monorepo root
# Start API backend first (required dependency)
docker compose --profile api up -d

# Start React frontend
docker compose --profile ui up -d

# View logs
docker compose logs -f hotel-ui-react

# Access: http://localhost:5173
```

**Implementation Details:**
- React 18.2 SPA with TypeScript 5.0
- Components: HomePage, ExplorePage, ContactPage, AvailableRoomsPage, ReservationPage, ApiTestPage
- Layout: SiteLayout with responsive navigation
- UI Components: Button, Container, FormField, ImageTile, SectionHeader
- API Integration: Vite proxy configuration for `/api/*` requests
- Responsive design: Mobile-first with breakpoints at 768px, 900px, 1024px
- Container automatically installs dependencies and starts Vite dev server
- Depends on `hotel-api-rest` service for backend API

### Phase 3.5: PostgreSQL Database (`hotel-db-postgres`)
```bash
# From monorepo root
docker compose --profile db up -d

# View logs
docker compose logs -f hotel-db-postgres

# Connect to database
docker compose exec hotel-db-postgres psql -U postgres -d hotel_reservation
```

**Implementation Details:**
- PostgreSQL 15 standalone database service
- Schema auto-initialized from `hotel-db-postgres/schema/` on first startup
- Shared across multiple phases (3.5, 4, 5, 6)
- Connection: `localhost:5432` (user: `postgres`, password: `postgres`, database: `hotel_reservation`)
- Can be used alongside MySQL-based phases for migration testing

### Starting Multiple Services

```bash
# Start all services together
docker compose --profile all up -d

# Start specific combination (e.g., API + UI + Database)
docker compose --profile api --profile ui --profile db up -d

# Stop all services
docker compose --profile all down

# Stop specific service
docker compose stop hotel-api-rest
```

---

## Technology Stack Evolution

```
Phase 1 (Legacy) - hotel-monolith
├── Frontend: JSP (JavaServer Pages) + Bootstrap
├── Backend: EJB 3.1 Session Beans + JPA 2.1 (EclipseLink)
├── Server: GlassFish 4.1.1
├── Database: MySQL 8.0
├── Build: Apache Ant
└── JDK: Java 8

Phase 2 (RESTful) ✅ - hotel-api-rest
├── Frontend: JSP (unchanged)
├── Backend: EJB 3.1 + JPA 2.1 + JAX-RS (Jersey) + Jackson JSON
├── Server: GlassFish 4.1.1
├── Database: MySQL 8.0
├── Build: Apache Ant
└── JDK: Java 8

Phase 3 (React) ✅ - hotel-ui-react
├── Frontend: React 18.2 + TypeScript 5.0 + Vite 5.0 + CSS Modules
├── Backend: EJB 3.1 + JPA 2.1 + JAX-RS (unchanged, consumed via REST API)
├── Server: GlassFish 4.1.1 (backend), Vite dev server (frontend)
├── Database: MySQL 8.0
├── Build: Vite (frontend), Apache Ant (backend)
└── Runtime: Node.js 20+ (frontend), Java 8 (backend)

Phase 3.5 (PostgreSQL) ✅ - hotel-db-postgres
├── Database: PostgreSQL 15 (standalone service)
├── Deployment: Docker Compose
├── Schema: Auto-initialized with migrations
└── Usage: Shared across multiple phases (3.5, 4, 5, 6)

Phase 4 (Spring Boot) Recommended Next
├── Frontend: React/Angular → CloudFront
├── Backend: Spring Boot REST API
├── Server: Embedded Tomcat
└── Database: PostgreSQL

Phase 5 (Serverless)
├── Frontend: React + Vite → S3 + CloudFront
├── Backend: AWS Lambda
├── Server: Serverless (AWS Lambda)
└── Database: DynamoDB

Phase 6 (Microservices)
├── Frontend: React → CloudFront
├── Backend: Quarkus microservices
├── Orchestration: Kubernetes
└── Database: PostgreSQL + DynamoDB
```

---

## Architecture Comparison

These comparisons call out trade-offs in cost, delivery complexity, operational ownership, and team skill alignment. Estimates assume a small-to-medium production footprint in a single AWS region, on‑demand pricing, modest traffic, and one non‑production environment. Costs exclude enterprise support and third‑party observability; complexity reflects build/deploy effort, runtime operations, and blast radius. Expect variance based on scale, traffic patterns, compliance needs, regional redundancy, and automation maturity.

### Cost Estimate (Monthly)

| Phase | Infrastructure | Total Monthly |
|-------|----------------|---------------|
| Phase 1 | EC2 + RDS | $100-250 |
| Phase 2 | EC2 + RDS | $100-250 |
| Phase 3 | EC2 + RDS + S3 + CloudFront | $135-285 |
| Phase 4 | ECS + RDS + CloudFront | $175-395 |
| Phase 5 | Lambda + DynamoDB + S3 + CloudFront | $30-160 |
| Phase 6 | EKS + RDS + CloudFront | $580-1380 |

### Complexity Comparison

```
Phase 1: Legacy       ████████
Phase 2: RESTful      █████████
Phase 3: SPA           ██████████
Phase 4: Spring Boot   █████████████
Phase 5: Serverless    ████████████
Phase 6: Microservices ████████████████
```

---

## Decision Framework

Use this framework to pick the next phase that matches your constraints instead of chasing a generic “best” architecture. Start from where you are and move only as far as your drivers require.

- **Primary drivers**: timeline, risk tolerance, budget, and team skill set
- **Operational model**: SLAs/SLOs, on-call maturity, who owns runtime operations
- **Data considerations**: migration complexity, downtime windows, backward compatibility
- **Integration needs**: external systems, mobile apps, partner APIs, event streaming
- **Compliance/security**: PII handling, network boundaries, auditability, least privilege
- **Scaling profile**: predictable vs. spiky workloads; regional vs. global distribution

Common guided paths:
- 2 → 3 → 4: Stable services, long-term maintainability, strong Spring expertise
- 2 → 3 → 5: Spiky/variable traffic, lean ops, preference for managed services
- 2 → 3 → 6: Multiple independent teams, clear domain boundaries, high scale

**Phase 2 (Restful API):**
- Enables API-first development without major infrastructure changes
- Supports mobile applications via REST API
- Allows easy decoupling of frontend for future modernization
- Minimizes risk and project timeline
- Works within existing Java EE 7 infrastructure
- Preserves current JSP/Servlet interface

**Phase 3 (React SPA):**
- Modern user experience
- Frontend/backend teams can work independently
- Maintains backend unchanged
- Incremental modernization
- Budget: $40-80k, Timeline: 6-8 weeks

**Phase 4 (Spring Boot):**
- Provides industry-standard framework
- Good for teams that have Spring expertise
- Long-term maintainability is priority
- Budget: $60-150k, Timeline: 10-12 weeks

**Phase 5 (Serverless):**
- Pay-per-use pricing
- You have variable traffic patterns
- You prefer managed services
- Budget: $20-60k, Timeline: 8-10 weeks

**Phase 6 (Microservices):**
- You have massive scale requirements
- Multiple independent teams
- DevOps maturity available
- Budget: $200k+, Timeline: 16+ weeks

### Reference

[Decision Framework](./docs/DECISION_FRAMEWORK.md)

---

## Development Environment

All phases can be developed using **Docker Compose** from the monorepo root. The root `docker-compose.yml` orchestrates all services on a shared network with profile-based service management.

### Quick Start

```bash
# From monorepo root - start all services
docker compose --profile all up -d

# Start specific services
docker compose --profile api up -d      # REST API backend
docker compose --profile ui up -d        # React frontend
docker compose --profile db up -d        # PostgreSQL database
docker compose --profile monolith up -d  # Legacy monolith

# View logs
docker compose logs -f [service-name]

# Stop services
docker compose --profile all down
```

### Service Access

Once services are running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/HotelReservation-war/
- **API Admin Console**: http://localhost:4850
- **Monolith Admin Console**: http://localhost:4849
- **PostgreSQL**: localhost:5432

### Development Workflow

For backend services (monolith, API), containers idle and wait for manual deployment:

```bash
# Exec into container and deploy
docker compose exec hotel-api-rest bash
./deploy.sh    # Build and deploy application
```

For frontend, the container automatically starts the Vite dev server.

### Full Documentation

For comprehensive setup instructions, troubleshooting, and alternative development workflows (including individual DevContainers), see **[DEVCONTAINER_SETUP.md](./docs/DEVCONTAINER_SETUP.md)**.


---

## Portfolio Goals

This portfolio demonstrates:

1. **Multiple Paths**: Show different modernization approaches, not just one "best" way
2. **Practical Examples**: Working code with Docker Compose orchestration
3. **Clear Trade-offs**: Transparent analysis of cost, complexity, and benefits
4. **Incremental Migration**: Each phase builds on previous phases
5. **Real-World Context**: Addresses actual enterprise modernization needs

---

## Contributing

This is a portfolio/demonstration repository. All contributions to improve documentation, examples, or add new modernization strategies are welcome.

---

## License

All phases are licensed under [MIT License](./LICENSE).

---

## References

- [Java EE 7 Specification](https://javaee.github.io/javaee-spec/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [AWS Architecture Center](https://aws.amazon.com/architecture/)

---

**Last Updated**: November 2025  

