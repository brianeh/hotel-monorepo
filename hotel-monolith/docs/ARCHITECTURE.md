# Hotel Reservation System - Architecture Documentation

## Overview

The Hotel Reservation System follows a **3-Tier Java EE Architecture** with clear separation of concerns across presentation, business logic, and data layers.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER                                │
│                                                                         │
│                         Web Browser (HTTP/HTTPS)                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP Requests/Responses
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                              │
│                        (HotelReservation-war)                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                       JSP Views                                 │    │
│  │  • home.jsp              - Search form                          │    │
│  │  • available_rooms.jsp   - Room listings                        │    │
│  │  • reservation.jsp       - Booking form                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Servlet Controllers                          │    │
│  │  • Home                  - Room availability logic              │    │
│  │  • AvailableRooms        - Room selection                       │    │
│  │  • FinalReservation      - Booking submission                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                    │
│                                    │ @EJB Dependency Injection          │
│                                    ▼                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Local EJB Calls
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BUSINESS LOGIC LAYER                             │
│                        (HotelReservation-ejb)                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                 EJB Session Facades (@Stateless)                │    │
│  │                                                                 │    │
│  │  ┌───────────────────────────────────────────────────────────┐  │    │
│  │  │  RoomFacadeLocal (Interface)                              │  │    │
│  │  │  └─> RoomFacade (Implementation)                          │  │    │
│  │  │      • findAll()                                          │  │    │
│  │  │      • find(id)                                           │  │    │
│  │  │      • create(room)                                       │  │    │
│  │  │      • edit(room)                                         │  │    │
│  │  │      • remove(room)                                       │  │    │
│  │  └───────────────────────────────────────────────────────────┘  │    │
│  │                                                                 │    │
│  │  ┌───────────────────────────────────────────────────────────┐  │    │
│  │  │  ReservationFacadeLocal (Interface)                       │  │    │
│  │  │  └─> ReservationFacade (Implementation)                   │  │    │
│  │  │      • findAll()                                          │  │    │
│  │  │      • find(id)                                           │  │    │
│  │  │      • create(reservation)                                │  │    │
│  │  │      • edit(reservation)                                  │  │    │
│  │  │      • remove(reservation)                                │  │    │
│  │  └───────────────────────────────────────────────────────────┘  │    │
│  │                                                                 │    │
│  │  ┌───────────────────────────────────────────────────────────┐  │    │
│  │  │  AbstractFacade<T> (Base Class)                           │  │    │
│  │  │      • Generic CRUD operations                            │  │    │
│  │  │      • Criteria API queries                               │  │    │
│  │  └───────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                    │
│                                    │ @PersistenceContext                │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    JPA Persistence Layer                        │    │
│  │                                                                 │    │
│  │  ┌─────────────────────────┐  ┌───────────────────────────┐     │    │
│  │  │  Room Entity (@Entity)  │  │  Reservation Entity       │     │    │
│  │  │  • id (PK)              │  │  • id (PK)                │     │    │
│  │  │  • description          │  │  • idRoom (FK)            │     │    │
│  │  │  • numberOfPerson       │  │  • checkInDate            │     │    │
│  │  │  • havePrivateBathroom  │  │  • checkOutDate           │     │    │
│  │  │  • price                │  │  • fullName               │     │    │
│  │  └─────────────────────────┘  │  • email                  │     │    │
│  │                                │  • phone                 │     │    │
│  │                                │  • specialRequest        │     │    │
│  │                                └──────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                    │
│                                    │ JDBC/JPA (EclipseLink)             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          INFRASTRUCTURE LAYER                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │               GlassFish Application Server 4.1.1                │    │
│  │                                                                 │    │
│  │  • Servlet Container       (JSP/Servlet execution)              │    │
│  │  • EJB Container          (Session Bean management)             │    │
│  │  • JPA Provider           (EclipseLink)                         │    │
│  │  • JNDI                   (Resource lookup)                     │    │
│  │  • Connection Pool        (HotelReservationPool)                │    │
│  │  • JDBC Resource          (hotel)                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                    │
│                                    │ MySQL JDBC Driver                  │
│                                    ▼                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                   │
│                                                                         │
│                         MySQL Database 8.0                              │
│                     (hotel_reservation_system)                          │
│                                                                         │
│  ┌──────────────────────┐          ┌──────────────────────────┐         │
│  │   room table         │          │   reservation table      │         │
│  ├──────────────────────┤          ├──────────────────────────┤         │
│  │ id (PK)              │          │ id (PK)                  │         │
│  │ description          │          │ id_room (FK)             │         │
│  │ number_of_person     │◄─────────│ check_in_date            │         │
│  │ have_private_bathroom│          │ check_out_date           │         │
│  │ price                │          │ full_name                │         │
│  └──────────────────────┘          │ email                    │         │
│                                    │ phone                    │         │
│                                    │ special_request          │         │
│                                    └──────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Presentation Layer (WAR Module)

**Technology Stack:**
- JSP (JavaServer Pages)
- Servlets
- JSTL 1.2
- Apache Commons Codec 1.7

**Components:**

#### JSP Views
- `home.jsp` - Landing page with date range search
- `available_rooms.jsp` - Displays filtered room results
- `reservation.jsp` - Booking form for selected room

#### Servlet Controllers
- `Home` - Handles room search and availability filtering
  - Fetches all rooms via `RoomFacadeLocal`
  - Fetches all reservations via `ReservationFacadeLocal`
  - Filters rooms based on date conflicts
  - Forwards to `available_rooms.jsp`

- `AvailableRooms` - Handles room selection
  - Captures room details
  - Forwards to `reservation.jsp`

- `FinalReservation` - Handles booking submission
  - Creates new `Reservation` entity
  - Persists via `ReservationFacadeLocal.create()`
  - Redirects to confirmation

**Deployment:**
- WAR file deployed to GlassFish
- Context root: `/HotelReservation-war/`
- Port: `8080`

---

### 2. Business Logic Layer (EJB Module)

**Technology Stack:**
- EJB 3.1 (Enterprise JavaBeans)
- JPA 2.1 (Java Persistence API)
- EclipseLink (JPA Provider)

**Components:**

#### Session Beans (@Stateless)

**RoomFacade:**
- Local interface: `RoomFacadeLocal`
- Provides CRUD operations for `Room` entities
- Extends `AbstractFacade<Room>`
- Manages `@PersistenceContext`

**ReservationFacade:**
- Local interface: `ReservationFacadeLocal`
- Provides CRUD operations for `Reservation` entities
- Extends `AbstractFacade<Reservation>`
- Manages `@PersistenceContext`

**AbstractFacade<T>:**
- Generic base class for all facades
- Implements common CRUD operations:
  - `create(T entity)`
  - `edit(T entity)`
  - `remove(T entity)`
  - `find(Object id)`
  - `findAll()`
  - `findRange(int[] range)`
  - `count()`
- Uses JPA Criteria API for queries

#### JPA Entities

**Room:**
```java
@Entity
@Table(name = "room")
- id: Integer (PK, Auto-generated)
- description: String (Text)
- numberOfPerson: Integer
- havePrivateBathroom: Boolean
- price: Double
```

**Reservation:**
```java
@Entity
@Table(name = "reservation")
- id: Integer (PK, Auto-generated)
- idRoom: Integer (FK to room.id)
- checkInDate: Date
- checkOutDate: Date
- fullName: String
- email: String
- phone: String
- specialRequest: String (Text)
```

**Persistence Configuration:**
- Persistence Unit: `HotelReservation-ejbPU`
- Transaction Type: JTA (Java Transaction API)
- Data Source: `hotel` (JNDI)
- Provider: EclipseLink

**Deployment:**
- EJB-JAR packaged inside EAR
- Container-managed transactions
- Dependency injection via `@EJB`

---

### 3. Infrastructure Layer

**GlassFish Application Server 4.1.1:**
- Servlet 3.1 Container
- EJB 3.1 Container
- JPA 2.1 Provider (EclipseLink)
- Admin Console: `http://localhost:4848`
- HTTP Port: `8080`
- HTTPS Port: `8181`

**JDBC Configuration:**
- Connection Pool: `HotelReservationPool`
  - Driver: `com.mysql.cj.jdbc.MysqlDataSource`
  - Type: `javax.sql.DataSource`
  - Properties:
    - `user=root`
    - `password=root`
    - `databaseName=hotel_reservation_system`
    - `serverName=localhost`
    - `port=3306`
    - `useSSL=false`
    - `serverTimezone=UTC`

- JDBC Resource: `hotel`
  - JNDI Name: `hotel`
  - Pool: `HotelReservationPool`

**Dependencies:**
- MySQL Connector Java 8.0.16
- JSTL 1.2
- Commons Codec 1.7

---

### 4. Data Layer

**MySQL Database 8.0:**
- Database: `hotel_reservation_system`
- Authentication: `root:root`
- Port: `3306`

**Schema:**

```sql
-- room table
CREATE TABLE room (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT,
    number_of_person INT,
    have_private_bathroom BOOLEAN,
    price DOUBLE
);

-- reservation table
CREATE TABLE reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_room INT NOT NULL,
    check_in_date DATE,
    check_out_date DATE,
    full_name VARCHAR(25),
    email VARCHAR(25),
    phone VARCHAR(20),
    special_request TEXT,
    FOREIGN KEY (id_room) REFERENCES room(id)
);
```

**Sample Data:**
- 10 pre-configured rooms ($50 - $500)
- 8 sample reservations

---

## Request Flow

### Typical User Journey: Searching & Booking a Room

```
1. User → Browser
   │
   ├─> GET /HotelReservation-war/views/home.jsp
   │   └─> Display search form (check-in/check-out dates)
   │
2. User submits search
   │
   ├─> GET /HotelReservation-war/home?checkInDate=2025-01-01&checkOutDate=2025-01-03
   │   │
   │   ├─> Home Servlet
   │   │   │
   │   │   ├─> @EJB RoomFacadeLocal.findAll()
   │   │   │   └─> ReservationFacade → EntityManager → MySQL
   │   │   │       └─> SELECT * FROM room
   │   │   │
   │   │   ├─> @EJB ReservationFacadeLocal.findAll()
   │   │   │   └─> ReservationFacade → EntityManager → MySQL
   │   │   │       └─> SELECT * FROM reservation
   │   │   │
   │   │   ├─> Filter logic (date conflict detection)
   │   │   │   └─> Remove booked rooms from available list
   │   │   │
   │   │   └─> Forward to available_rooms.jsp
   │   │       └─> Display filtered room list
   │
3. User selects a room
   │
   ├─> GET /HotelReservation-war/available_rooms?roomId=3&price=150&...
   │   │
   │   ├─> AvailableRooms Servlet
   │   │   └─> Forward to reservation.jsp
   │   │       └─> Display booking form
   │
4. User submits booking
   │
   └─> POST /HotelReservation-war/reservation
       │
       ├─> FinalReservation Servlet
       │   │
       │   ├─> Create Reservation entity
       │   │
       │   ├─> @EJB ReservationFacadeLocal.create(reservation)
       │   │   └─> ReservationFacade → EntityManager → MySQL
       │   │       └─> INSERT INTO reservation VALUES (...)
       │   │
       │   └─> Forward to home.jsp (confirmation)
       │
       └─> Success!
```

---

## Design Patterns

### 1. **Model-View-Controller (MVC)**
- **Model:** JPA Entities (Room, Reservation)
- **View:** JSP Pages (home, available_rooms, reservation)
- **Controller:** Servlets (Home, AvailableRooms, FinalReservation)

### 2. **Facade Pattern**
- `RoomFacade` and `ReservationFacade` provide simplified interfaces
- Hide complex EntityManager operations
- Abstract JPA implementation details

### 3. **Data Access Object (DAO)**
- `AbstractFacade<T>` implements generic DAO pattern
- Provides reusable CRUD operations
- Reduces code duplication

### 4. **Dependency Injection**
- `@EJB` annotation for automatic bean injection
- Container manages bean lifecycle
- Loose coupling between layers

### 5. **Template Method**
- `AbstractFacade` defines algorithm structure
- Subclasses implement specific behavior (`getEntityManager()`)

### 6. **Front Controller**
- Servlets act as front controllers
- Handle HTTP requests/responses
- Delegate to business logic (EJBs)

---

## Technology Stack Summary

| Layer              | Technology                                    |
|--------------------|-----------------------------------------------|
| **Frontend**       | JSP, JSTL, HTML, CSS                          |
| **Web Layer**      | Servlets 3.1, Apache Commons Codec            |
| **Business Logic** | EJB 3.1 (Stateless Session Beans)             |
| **Persistence**    | JPA 2.1 (EclipseLink)                         |
| **Database**       | MySQL 8.0                                     |
| **App Server**     | GlassFish 4.1.1                               |
| **Build Tool**     | Apache Ant 1.10.7                             |
| **JDK**            | Java 8                                        |
| **DevContainer**   | Docker with DevContainer support              |

---

## Deployment Structure

```
HotelReservation.ear
├── HotelReservation-ejb.jar
│   ├── META-INF/
│   │   ├── persistence.xml
│   │   └── MANIFEST.MF
│   ├── models/
│   │   ├── Room.class
│   │   └── Reservation.class
│   └── sessionbeans/
│       ├── AbstractFacade.class
│       ├── RoomFacade.class
│       ├── RoomFacadeLocal.class
│       ├── ReservationFacade.class
│       └── ReservationFacadeLocal.class
│
├── HotelReservation-war.war
│   ├── WEB-INF/
│   │   ├── web.xml
│   │   ├── lib/
│   │   │   ├── jstl-1.2.jar
│   │   │   └── commons-codec-1.7.jar
│   │   └── classes/
│   │       └── servlets/
│   │           ├── Home.class
│   │           ├── AvailableRooms.class
│   │           └── FinalReservation.class
│   └── views/
│       ├── home.jsp
│       ├── available_rooms.jsp
│       └── reservation.jsp
│
└── META-INF/
    ├── application.xml
    └── glassfish-application.xml
```

---

## Security Considerations

⚠️ **Current Implementation Notes:**

1. **No Authentication/Authorization**
   - Public access to all endpoints
   - No user management system

2. **SQL Injection Risk**
   - JPA/JPQL mitigates most risks
   - Parameterized queries used throughout

3. **No Input Validation**
   - Minimal client-side validation
   - Server-side validation needed

4. **No HTTPS**
   - Currently HTTP only (port 8080)
   - Sensitive data transmitted in clear text

5. **Hardcoded Credentials**
   - Database credentials in persistence.xml
   - Should use environment variables

**Recommendations for Production:**
- Implement authentication (Java EE Security)
- Add input validation (Bean Validation)
- Enable HTTPS
- Externalize configuration
- Add logging and monitoring
- Implement session management
- Add CSRF protection

---

## Performance Considerations

**Current Optimizations:**
- Stateless EJBs (scalable, thread-safe)
- Connection pooling (HotelReservationPool)
- JPA L2 caching (EclipseLink default)

**Potential Improvements:**
- Add pagination for room listings
- Implement caching for frequently accessed data
- Optimize date conflict query (currently in-memory)
- Add database indexes (check_in_date, check_out_date)
- Implement lazy loading for large datasets

---

## Development Workflow

**Build Process:**
```bash
# Clean previous builds
ant clean

# Build EAR (includes WAR and EJB-JAR)
ant dist

# Deploy to GlassFish
./deploy.sh
```

**DevContainer Setup:**
1. Open in DevContainer (7-minute setup)
2. Services auto-start (MySQL, GlassFish)
3. JDBC resources auto-configured
4. Sample data pre-loaded
5. Ready to develop!

**Deployment:**
```bash
asadmin deploy --force=true dist/HotelReservation.ear
```

**Testing:**
- Access: `http://localhost:8080/HotelReservation-war/`
- Admin: `http://localhost:4848`
- Status: `./status.sh`

---

## Architecture Benefits

✅ **Separation of Concerns**
- Clear boundaries between layers
- Independent development and testing
- Easy to maintain and extend

✅ **Scalability**
- Stateless EJBs support horizontal scaling
- Connection pooling optimizes database access
- Container-managed resources

✅ **Reusability**
- Abstract facade pattern
- Generic CRUD operations
- Shared entity models

✅ **Maintainability**
- Well-organized package structure
- Consistent naming conventions
- Design pattern usage

✅ **Testability**
- Local EJB interfaces for mocking
- Dependency injection
- Isolated business logic

---

## Future Enhancements

**Short-term:**
- [ ] Add input validation
- [ ] Implement error handling
- [ ] Add logging framework (SLF4J)
- [ ] Create admin panel

**Mid-term:**
- [ ] REST API (JAX-RS)
- [ ] User authentication
- [ ] Email notifications
- [ ] Payment integration

**Long-term:**
- [ ] Migrate to microservices
- [ ] Add mobile app
- [ ] Implement analytics
- [ ] Multi-hotel support

---

## References

- **Java EE 7 Specification:** [https://javaee.github.io/javaee-spec/](https://javaee.github.io/javaee-spec/)
- **GlassFish Documentation:** [https://javaee.github.io/glassfish/](https://javaee.github.io/glassfish/)
- **JPA 2.1 Specification:** [https://jcp.org/en/jsr/detail?id=338](https://jcp.org/en/jsr/detail?id=338)
- **EJB 3.1 Specification:** [https://jcp.org/en/jsr/detail?id=318](https://jcp.org/en/jsr/detail?id=318)

---

**Document Version:** 1.0  
**Last Updated:** October 21, 2025  
**Author:** Hotel Reservation System Team

