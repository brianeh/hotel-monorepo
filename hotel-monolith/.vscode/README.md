# VS Code IDE Support for Hotel Reservation System

This directory contains VS Code configuration files that provide comprehensive IDE support for the Hotel Reservation System Java EE project.

## Quick Start

1. **Open in DevContainer**: Use the DevContainer for the best development experience
2. **Install recommended extensions**: VS Code will prompt you to install them (or they're pre-installed in DevContainer)
3. **Build the project**: Press `Ctrl+Shift+B` or use Command Palette → "Tasks: Run Build Task"

## Configuration Files

### `.vscode/settings.json`
- Java 8 runtime configuration
- Source path mapping for multi-module structure
- Ant build system integration
- File exclusions for build artifacts
- Code formatting and import organization

### `.vscode/tasks.json`
- **Build (Full Project)**: `Ctrl+Shift+B` - Builds entire project
- **Clean**: Removes all build artifacts
- **Build EJB Module**: Builds only the EJB module
- **Build WAR Module**: Builds only the WAR module
- **Create Distribution**: Creates distribution archives
- **Deploy to GlassFish**: Runs `./deploy.sh`
- **Check Services Status**: Runs `./status.sh`

### `.vscode/launch.json`
- **Attach to GlassFish**: Remote debugging on port 9009
- **Debug Current File**: Debug individual Java files

### `.vscode/extensions.json`
- Lists recommended extensions for Java EE development
- Includes database, web development, and Java-specific tools

## Key Features

### ✅ Full Ant Build Integration
- All existing `build.xml` files work without modification
- VS Code tasks map directly to Ant targets
- Build output shows in integrated terminal
- Click on errors to jump to source files

### ✅ Multi-Module Support
- Proper source path configuration for EJB and WAR modules
- Cross-module navigation and IntelliSense
- Module-specific build tasks

### ✅ Java EE Development
- JSP syntax highlighting and IntelliSense
- XML configuration file support
- Database integration with MySQL client
- GlassFish debugging support

### ✅ Web Development
- HTML, CSS, JavaScript support
- JSP syntax highlighting and IntelliSense
- JSP file associations (`.jsp`, `.jspf`)
- Emmet support for JSP files
- JSP validation and formatting

## Usage Tips

### Building the Project
```bash
# Quick build (default task)
Ctrl+Shift+B

# Or use Command Palette
Ctrl+Shift+P → "Tasks: Run Task" → "Build (Full Project)"
```

### Debugging
1. Ensure GlassFish is running with debug enabled
2. Use "Attach to GlassFish" configuration
3. Set breakpoints in your Java code
4. Start debugging (F5)

### Working with Modules
- The project structure shows EJB and WAR modules in separate directories
- Build individual modules using specific tasks
- Cross-module navigation works seamlessly

### Database Access
- MySQL client extension provides database browser
- Connect using: `localhost:3306`, user: `root`, password: `root`
- Database: `hotel_reservation_system`

## Troubleshooting

### Import Resolution Issues (javax.persistence, etc.)
If you see errors like `javax.persistence.Basic cannot be resolved`:

1. **Reload Java Projects**: `Ctrl+Shift+P` → "Java: Reload Projects"
2. **Alternative**: `Ctrl+Shift+P` → "Developer: Reload Window"
3. **Verify**: All Java EE imports should now resolve correctly

**What was fixed**: VS Code now includes all Java EE libraries from GlassFish:
- JPA (`javax.persistence.*`) - Entity annotations
- EJB (`javax.ejb.*`) - Session bean annotations
- Servlet (`javax.servlet.*`) - Web servlet classes
- Validation (`javax.validation.*`) - Bean validation constraints
- JAXB (`javax.xml.bind.*`) - XML binding annotations
- MySQL JDBC driver - Database connectivity

### Java Language Server Issues
- Reload window: `Ctrl+Shift+P` → "Developer: Reload Window"
- Check Java home path in settings
- Ensure Ant is properly configured

### Build Issues
- Check that all services are running: `./status.sh`
- Clean and rebuild: Use "Clean" task, then "Build"
- Check terminal output for detailed error messages

### Debugging Issues
- Ensure GlassFish is running with debug enabled
- Check that port 9009 is accessible
- Verify the application is deployed

### JSP Syntax Highlighting Issues
If JSP files don't show syntax highlighting:

1. **Install JSP Extension**: 
   - Command Palette → "Extensions: Install Extensions"
   - Search for "JSP" and install "JSP Language Support"

2. **Reload Window**: 
   - `Ctrl+Shift+P` → "Developer: Reload Window"

3. **Check File Association**: 
   - Right-click JSP file → "Open With" → "JSP Language Support"

4. **Verify Settings**: 
   - Ensure `.jsp` files are associated with JSP language mode

## DevContainer Integration

The project is designed for DevContainer development with:
- Pre-configured Java 8 environment
- GlassFish and MySQL services
- All necessary VS Code extensions pre-installed
- Automatic service startup
- Complete IDE configuration

To use DevContainer:
1. Open in VS Code with DevContainers extension
2. Reopen in container when prompted
3. Wait for automatic setup (~7 minutes)
4. Start developing immediately with full IDE support

## Additional Resources

- [VS Code Java Extension Pack](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack)
- [Ant Build System](https://ant.apache.org/)
- [Java EE Development](https://www.oracle.com/java/technologies/java-ee-glance.html)
