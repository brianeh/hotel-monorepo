# Changes Made to Disable MOXy and Use Jackson for JSON Parsing

## Overview

This configuration change was necessary to resolve `ClassNotFoundException` errors that occurred when using MOXy (EclipseLink's JSON binding provider) as the default JSON serializer in GlassFish 4. While MOXy is supposed to be included in Java EE 7 and GlassFish 4, it often has missing or misconfigured libraries in the classpath, leading to runtime errors when the REST API attempts to serialize entities to JSON.

Jackson provides a more reliable alternative because it's self-contained and doesn't depend on GlassFish's MOXy implementation. By bundling Jackson JARs directly in `WEB-INF/lib/`, we gain full control over JSON serialization without relying on the application server's potentially incomplete or buggy MOXy support. The `jackson-module-jaxb-annotations` library allows Jackson to process the existing `@XmlRootElement` annotations on our JPA entities, making the transition seamless.

This approach is widely used in production Java EE applications as a workaround for GlassFish 4's JSON provider issues, providing better reliability and broader community support.

## Required Changes

### 1. Modified: `HotelReservation-war/src/java/rest/ApplicationConfig.java`
**Purpose**: Disable MOXy JSON provider and enable Jackson
**Change**: Added `jersey.config.server.disableMoxyJson = true` property
**Status**: ✅ REQUIRED

```java
props.put("jersey.config.server.disableMoxyJson", true);
```

### 2. Added: `HotelReservation-war/web/WEB-INF/lib/jackson-module-jaxb-annotations-2.9.10.jar`
**Purpose**: Provide support for JAXB annotations in Jackson
**Status**: ✅ REQUIRED

This JAR file (33 KB) enables Jackson to process JAXB annotations like `@XmlRootElement` 
that are used in the Room and Reservation entities.

### 3. Added: `HotelReservation-war/web/WEB-INF/beans.xml`
**Purpose**: Enable CDI (Contexts and Dependency Injection) for JAX-RS
**Status**: ✅ REQUIRED

Required for `@EJB` injection to work in `RoomResource` and proper container management.


## Build and Deploy

After these changes, rebuild and deploy:
```bash
./build.sh clean
./build.sh
./deploy.sh
```

## Verification

Test the REST API:
```bash
curl http://localhost:8080/HotelReservation-war/api/rooms
```

Expected behavior:
- JSON response using Jackson instead of MOXy
- No ClassNotFoundException errors
- Proper serialization of Room and Reservation entities

