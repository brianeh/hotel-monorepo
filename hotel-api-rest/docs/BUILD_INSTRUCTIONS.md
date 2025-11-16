# Hotel Reservation Build Instructions

## Build Issue Resolution

The project was failing to build due to missing NetBeans-specific dependencies. The error was:

```
The libs.CopyLibs.classpath property is not set up.
This property must point to org-netbeans-modules-java-j2seproject-copylibstask.jar file
```

## Solution

A build script (`build.sh`) has been created that automatically sets the required environment variables:

- `libs.CopyLibs.classpath=/opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar`
- `j2ee.server.home=/opt/glassfish4/glassfish`

## Usage

### IDE Build (Cmd+Shift+B) ✅
The IDE is now configured to use the build script automatically. Simply press **Cmd+Shift+B** to build the project.

### Using the Build Script (Command Line)
```bash
# Clean the project
./build.sh clean

# Build the project
./build.sh

# Build with specific target
./build.sh dist
```

### Manual Build (Alternative)
If you prefer to run ant directly, use:
```bash
ant -Dlibs.CopyLibs.classpath=/opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar -Dj2ee.server.home=/opt/glassfish4/glassfish [target]
```

## Prerequisites

- GlassFish Server 4 installed at `/opt/glassfish4/glassfish`
- NetBeans CopyLibs library at `/opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar`
- Java 8 or higher
- Apache Ant

## Build Output

The build creates:
- `HotelReservation-ejb/dist/HotelReservation-ejb.jar` - EJB module
- `HotelReservation-war/dist/HotelReservation-war.war` - Web module  
- `dist/HotelReservation.ear` - Enterprise Application Archive

## Notes

- Some warnings about missing library files are expected and don't affect the build
- The project uses Java EE 7 platform
- EclipseLink and MySQL connector warnings can be ignored for basic functionality
