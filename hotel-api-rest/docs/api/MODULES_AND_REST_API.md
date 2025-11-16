# Hotel Reservation System - Module Architecture and REST API Implementation

## Table of Contents
1. [Current Module Architecture](#current-module-architecture)
2. [RESTful API Implementation](#restful-api-implementation)
3. [Implementation Examples](#implementation-examples)
4. [API Testing](#api-testing)

---

## Current Module Architecture

The Hotel Reservation System follows a **Java EE Enterprise Application (EAR) architecture** with three distinct modules that provide separation of concerns and modular deployment capabilities.

### HotelReservation EAR Module (Main Project)

**Purpose**: Enterprise Application Archive that packages both EJB and WAR modules into a single deployable unit.

**Configuration**:
- Main build file: `build.xml`
- Project properties: `nbproject/project.properties`
- Platform: Java EE 7 (`j2ee.platform=1.7`)
- Java version: Java 8 (`javac.source=1.8`, `javac.target=1.8`)
- Application server: GlassFish 4 (`j2ee.server.type=gfv3ee6`)

**Output**: `dist/HotelReservation.ear`

**Key Features**:
- Orchestrates the build process for both EJB and WAR modules
- Handles inter-module dependencies
- Creates the final Enterprise Application Archive

### HotelReservation-ejb Module (Business Logic Layer)

**Location**: `HotelReservation-ejb/`

**Purpose**: Contains all business logic, data access layer, and JPA entities.

**Key Components**:

#### Entities (`src/java/models/`)
- **Room.java**: JPA entity representing hotel rooms
  - Fields: `id`, `description`, `numberOfPerson`, `havePrivateBathroom`, `price`
  - Annotations: `@Entity`, `@Table(name = "room")`, `@XmlRootElement`
  - Named queries for common operations

- **Reservation.java**: JPA entity representing hotel reservations
  - Fields: `id`, `idRoom`, `checkInDate`, `checkOutDate`, `fullName`, `email`, `phone`, `specialRequest`
  - Annotations: `@Entity`, `@Table(name = "reservation")`, `@XmlRootElement`
  - Bean validation constraints (`@NotNull`, `@Size`)

#### Session Beans (`src/java/sessionbeans/`)
- **RoomFacade.java**: Stateless EJB providing room operations
  - Extends `AbstractFacade<Room>`
  - Implements `RoomFacadeLocal` interface
  - Uses `@PersistenceContext` for JPA operations

- **ReservationFacade.java**: Stateless EJB providing reservation operations
  - Extends `AbstractFacade<Reservation>`
  - Implements `ReservationFacadeLocal` interface
  - Handles reservation business logic

- **AbstractFacade.java**: Generic facade providing CRUD operations
  - Generic implementation for common database operations
  - Methods: `create()`, `edit()`, `remove()`, `find()`, `findAll()`, `findRange()`, `count()`

#### Persistence Configuration (`src/conf/`)
- **persistence.xml**: JPA configuration
  - Persistence unit: `HotelReservation-ejbPU`
  - Transaction type: JTA
  - Data source: `hotel` (JDBC resource)
  - MySQL connection properties

**Dependencies**: JPA, EJB, Bean Validation, JAXB, MySQL JDBC Driver

**Output**: `HotelReservation-ejb.jar`

### HotelReservation-war Module (Presentation Layer)

**Location**: `HotelReservation-war/`

**Purpose**: Web interface providing user interaction through servlets and JSP pages.

**Key Components**:

#### Servlets (`src/java/servlets/`)
- **Home.java**: Main servlet handling room availability search
  - Uses `@EJB` injection to access `ReservationFacadeLocal` and `RoomFacadeLocal`
  - Implements date-based room availability logic
  - Forwards to JSP for presentation

- **AvailableRooms.java**: Handles available rooms display
- **FinalReservation.java**: Processes reservation completion

#### Views (`web/views/`)
- **home.jsp**: Main landing page
- **available_rooms.jsp**: Displays search results
- **reservation.jsp**: Reservation form

#### Static Resources (`web/`)
- **CSS**: `css/` directory with styling files
- **JavaScript**: `js/` directory with client-side scripts
- **Images**: `images/` directory with banner images

#### Configuration (`web/WEB-INF/`)
- **web.xml**: Web application configuration
  - Servlet mappings
  - Welcome file configuration
  - Servlet 4.0 specification

**Module Dependency**: References `HotelReservation-ejb` for EJB injection

**Output**: `HotelReservation-war.war`

### Cross-Module Communication

**EJB Injection Pattern**:
```java
@EJB
private ReservationFacadeLocal reservationFacade;

@EJB
private RoomFacadeLocal roomFacade;
```

**VS Code Integration**:
- Source paths configured in `.vscode/settings.json`
- Cross-module navigation and IntelliSense support
- Build system handles inter-module dependencies

**Build Process**:
1. EJB module compiles first
2. WAR module references EJB JAR
3. EAR module packages both modules

---

## RESTful API Implementation

### Migration Approach: JAX-RS (Java API for RESTful Web Services)

**Why JAX-RS**:
- Already included in Java EE 7 platform (`javax.ws.rs-api.jar` in GlassFish classpath)
- No new dependencies required
- Works with Java 8
- Native GlassFish 4 support
- Entities already have `@XmlRootElement` annotation for JSON/XML serialization
- Built-in JSON support via MOXy (EclipseLink JSON binding)

### Implementation Strategy

#### 1. JAX-RS Application Configuration

Create `HotelReservation-war/src/java/rest/ApplicationConfig.java`:

```java
package rest;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

/**
 * JAX-RS Application configuration
 * 
 * This configuration disables MOXy JSON provider and allows Jersey
 * to use Jackson for JSON parsing instead.
 */
@ApplicationPath("api")
public class ApplicationConfig extends Application {

    @Override
    public Map<String, Object> getProperties() {
        Map<String, Object> props = new HashMap<>();
        // Disable MOXy JSON provider - this will make Jersey use Jackson
        props.put("jersey.config.server.disableMoxyJson", true);
        return props;
    }
}
```

#### 2. Room REST Resource

Create `HotelReservation-war/src/java/rest/RoomResource.java`:

```java
package rest;

import java.net.URI;
import java.util.List;

import javax.ejb.EJB;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import models.Room;
import sessionbeans.RoomFacadeLocal;

@Path("rooms")
public class RoomResource {

    @EJB
    private RoomFacadeLocal roomFacade;

    @GET
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public List<Room> getAllRooms() {
        return roomFacade.findAll();
    }

    @GET
    @Path("{id}")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response getRoom(@PathParam("id") Integer id) {
        if (id == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        Room room = roomFacade.find(id);

        if (room == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(room).build();
    }

    @POST
    @Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response createRoom(Room room) {
        try {
            roomFacade.create(room);
            return Response.created(URI.create("/api/rooms/" + room.getId())).entity(room).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @PUT
    @Path("{id}")
    @Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response updateRoom(@PathParam("id") Integer id, Room room) {
        try {
            room.setId(id);
            roomFacade.edit(room);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @DELETE
    @Path("{id}")
    public Response deleteRoom(@PathParam("id") Integer id) {
        try {
            Room room = roomFacade.find(id);
            if (room != null) {
                roomFacade.remove(room);
            }

            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }
}
```

#### 3. Reservation REST Resource

Create `HotelReservation-war/src/java/rest/ReservationResource.java`:

```java
package rest;

import java.net.URI;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import javax.ejb.EJB;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import models.Reservation;
import models.Room;
import sessionbeans.ReservationFacadeLocal;
import sessionbeans.RoomFacadeLocal;

@Path("reservations")
public class ReservationResource {

    @EJB
    private ReservationFacadeLocal reservationFacade;

    @EJB
    private RoomFacadeLocal roomFacade;

    @GET
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public List<Reservation> getAllReservations() {
        return reservationFacade.findAll();
    }

    @GET
    @Path("{id}")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response getReservation(@PathParam("id") Integer id) {
        if (id == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        Reservation reservation = reservationFacade.find(id);

        if (reservation == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(reservation).build();
    }

    @GET
    @Path("search")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response searchAvailability(@QueryParam("checkIn") String checkInStr,
            @QueryParam("checkOut") String checkOutStr) {
        if ((checkInStr == null) || (checkOutStr == null)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Both checkIn and checkOut parameters are required").build();
        }

        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date checkIn = sdf.parse(checkInStr);
            Date checkOut = sdf.parse(checkOutStr);

            List<Room> availableRooms = roomFacade.findAll();
            List<Reservation> reservations = reservationFacade.findAll();

            for (Reservation reservation : reservations) {
                if (hasDateConflict(checkIn, checkOut, reservation.getCheckInDate(), reservation.getCheckOutDate())) {
                    availableRooms.removeIf(room -> room.getId().equals(reservation.getIdRoom()));
                }
            }

            return Response.ok(availableRooms).build();

        } catch (ParseException e) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Invalid data format.  Use yyyy-MM-dd").build();
        }
    }

    @POST
    @Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response createReservation(Reservation reservation) {
        try {
            reservationFacade.create(reservation);
            return Response.created(
                    URI.create("/api/reservations/" + reservation.getId())).entity(reservation).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @PUT
    @Path("{id}")
    @Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Response updateReservation(@PathParam("id") Integer id, Reservation reservation) {
        try {
            reservation.setId(id);
            reservationFacade.edit(reservation);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @DELETE
    @Path("{id}")
    public Response cancelReservation(@PathParam("id") Integer id) {
        try {
            Reservation reservation = reservationFacade.find(id);
            if (reservation != null) {
                reservationFacade.remove(reservation);
            }
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    private boolean hasDateConflict(Date checkIn1, Date checkOut1, Date checkIn2, Date checkOut2) {
        return (checkIn1.before(checkOut2) && checkOut1.after(checkIn2));
    }
}
```

### API Endpoints

After deployment, the REST API will be accessible at:

**Base URL**: `http://localhost:8080/HotelReservation-war/api`

#### Room Endpoints
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/{id}` - Get specific room
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/{id}` - Update room
- `DELETE /api/rooms/{id}` - Delete room

#### Reservation Endpoints
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/{id}` - Get specific reservation
- `GET /api/reservations/search?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD` - Search available rooms
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/{id}` - Update reservation
- `DELETE /api/reservations/{id}` - Cancel reservation

### Advantages of This Approach

- **Zero new dependencies**: Uses existing Java EE 7 APIs
- **Jackson JSON support**: Configured to use Jackson instead of MOXy for better JSON serialization
- **Reuses existing EJB facades**: No business logic duplication
- **Compatible with current stack**: Works with Java 8 and GlassFish 4
- **Non-disruptive**: Existing JSP/Servlet UI continues to work unchanged
- **Prepared entities**: Entities already have `@XmlRootElement` for serialization
- **Automatic content negotiation**: JSON/XML support built-in
- **Validation support**: Leverages existing Bean Validation annotations
- **Proper null checking**: Enhanced error handling with null checks for request parameters

### Alternative Options Considered

- **Spring Boot**: Requires major dependency changes and migration
- **Jersey standalone**: Already included in GlassFish as JAX-RS reference implementation
- **RESTEasy**: Not needed, GlassFish provides JAX-RS support

---

## API Testing

### Using curl Commands

#### Get All Rooms
```bash
curl -X GET "http://localhost:8080/HotelReservation-war/api/rooms" \
     -H "Accept: application/json"
```

#### Get Specific Room
```bash
curl -X GET "http://localhost:8080/HotelReservation-war/api/rooms/1" \
     -H "Accept: application/json"
```

#### Create New Room
```bash
curl -X POST "http://localhost:8080/HotelReservation-war/api/rooms" \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{
       "description": "Deluxe Suite with Ocean View",
       "numberOfPerson": 4,
       "havePrivateBathroom": true,
       "price": 299.99
     }'
```

#### Search Available Rooms
```bash
curl -X GET "http://localhost:8080/HotelReservation-war/api/reservations/search?checkIn=2024-06-01&checkOut=2024-06-05" \
     -H "Accept: application/json"
```

#### Create New Reservation
```bash
curl -X POST "http://localhost:8080/HotelReservation-war/api/reservations" \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
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

#### Get All Reservations
```bash
curl -X GET "http://localhost:8080/HotelReservation-war/api/reservations" \
     -H "Accept: application/json"
```

#### Update Reservation
```bash
curl -X PUT "http://localhost:8080/HotelReservation-war/api/reservations/1" \
     -H "Content-Type: application/json" \
     -d '{
       "id": 1,
       "idRoom": 1,
       "checkInDate": "2024-06-01",
       "checkOutDate": "2024-06-06",
       "fullName": "John Doe",
       "email": "john.doe@example.com",
       "phone": "555-1234",
       "specialRequest": "Updated special request"
     }'
```

#### Cancel Reservation
```bash
curl -X DELETE "http://localhost:8080/HotelReservation-war/api/reservations/1"
```

### Interactive HTML Test Page

The easiest way to test the REST API is through the interactive HTML test page included in the application.

**Access URL**: `http://localhost:8080/HotelReservation-war/rest-test.html`

This interactive test page provides a visual, browser-based interface for testing all REST API endpoints without requiring command-line tools.

#### Features

- **Visual Interface**: Test all API endpoints through a user-friendly web interface
- **Auto-Loading**: Automatically loads and displays all rooms when the page opens
- **Interactive Forms**: Pre-filled forms for easy parameter entry
- **Real-Time Feedback**: See request status (loading, success, error) with visual indicators
- **Formatted Responses**: JSON responses are displayed in formatted, readable format
- **Room Cards**: Visual room cards with icons showing room details in an easy-to-read format
- **No Additional Tools Required**: Works directly in any modern web browser

#### Available Test Sections

1. **Get All Rooms** - Fetches all rooms from the hotel and displays them as visual cards
2. **Get Room by ID** - Enter a room ID to fetch specific room details as JSON
3. **Search Available Rooms** - Enter check-in and check-out dates to find available rooms
4. **Create Reservation** - Fill out the form to create a new reservation
5. **Get All Reservations** - View all existing reservations in JSON format

#### Usage

1. Deploy the application (if not already deployed): `./deploy.sh`
2. Open your web browser
3. Navigate to: `http://localhost:8080/HotelReservation-war/rest-test.html`
4. The page automatically loads and displays all rooms on startup
5. Click buttons to test different API endpoints
6. View formatted JSON responses or visual room cards in the response areas

#### Benefits Over curl

- **Visual Interface**: See results in formatted JSON and visual cards instead of raw command output
- **No Command Line**: No need to remember curl syntax or write commands
- **Interactive**: Click buttons and fill forms instead of typing long URLs
- **Easy to Share**: Simply share the URL with team members
- **Instant Feedback**: Visual status indicators show loading, success, and error states
- **Parameter Validation**: Forms help prevent errors with date pickers and input validation

### Response Examples

#### Room JSON Response
```json
{
  "id": 1,
  "description": "Standard Room with City View",
  "numberOfPerson": 2,
  "havePrivateBathroom": true,
  "price": 149.99
}
```

#### Reservation JSON Response
```json
{
  "id": 1,
  "idRoom": 1,
  "checkInDate": "2024-06-01T00:00:00Z",
  "checkOutDate": "2024-06-05T00:00:00Z",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "555-1234",
  "specialRequest": "Late checkout requested"
}
```

### Error Responses

#### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

#### 400 Bad Request
```json
{
  "error": "Invalid request data"
}
```

---

## Implementation Notes

### VS Code Configuration

The existing `.vscode/settings.json` already includes the WAR module source path:
```json
"java.project.sourcePaths": [
    "HotelReservation-ejb/src/java",
    "HotelReservation-war/src/java"  // Already includes rest package
]
```

No additional configuration is needed for the REST resources.

### JSON Provider Configuration

The `ApplicationConfig` class configures JAX-RS to use Jackson for JSON serialization instead of the default MOXy provider. This provides better JSON output and is configured via the `jersey.config.server.disableMoxyJson` property.

### Build Process

The REST resources will be automatically included in the WAR module build process:
1. Compile Java sources in `HotelReservation-war/src/java/`
2. Package into `HotelReservation-war.war`
3. Include in `HotelReservation.ear`

### Deployment

After implementing the REST resources:
1. Build the project: `ant dist`
2. Deploy: `./deploy.sh`
3. Access API at: `http://localhost:8080/HotelReservation-war/api/`

### No Changes Required

This implementation requires **no changes** to:
- Java version (stays Java 8)
- Application server (stays GlassFish 4)
- Existing dependencies
- Current module structure
- Existing servlets or JSP pages
- Database configuration
- Build system

The REST API will coexist with the existing web interface, providing both traditional web pages and modern API endpoints for the same underlying business logic.
