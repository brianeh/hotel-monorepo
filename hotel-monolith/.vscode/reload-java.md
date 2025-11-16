# Reload Java Language Server

If you're seeing import resolution errors like `javax.persistence.Basic cannot be resolved`, follow these steps:

## Quick Fix

1. **Open Command Palette**: `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. **Type**: "Java: Reload Projects"
3. **Select**: "Java: Reload Projects"
4. **Wait**: For the Java language server to reload and index the libraries

## Alternative Method

1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Type**: "Developer: Reload Window"
3. **Select**: "Developer: Reload Window"
4. **Wait**: For VS Code to reload with the new configuration

## Verify Configuration

After reloading, you should see:
- ✅ `javax.persistence.Basic` import resolves correctly
- ✅ All JPA annotations (`@Entity`, `@Id`, `@Column`, etc.) are recognized
- ✅ EJB annotations (`@Stateless`, `@LocalBean`, etc.) are recognized
- ✅ Servlet annotations (`@WebServlet`, etc.) are recognized
- ✅ Validation constraints (`@NotNull`, `@Size`, etc.) are recognized
- ✅ JAXB annotations (`@XmlRootElement`, etc.) are recognized

## Troubleshooting

If imports still don't resolve:

1. **Check Java Home**: Ensure it's set to Java 8
   - Command Palette → "Java: Configure Java Runtime"
   - Verify Java 8 is selected

2. **Check Library Paths**: Verify GlassFish libraries are accessible
   - The libraries are located in `/opt/glassfish4/glassfish/modules/`
   - This path is configured in `.vscode/settings.json`

3. **Clean and Rebuild**: 
   - Run "Clean" task
   - Run "Build (Full Project)" task
   - Reload Java projects again

## What Was Fixed

The VS Code configuration now includes all necessary Java EE libraries:
- `javax.persistence.jar` - JPA annotations and classes (`@Entity`, `@Id`, etc.)
- `ejb-api.jar` - EJB annotations and classes (`@Stateless`, `@LocalBean`, etc.)
- `javax.servlet-api.jar` - Servlet classes (`@WebServlet`, etc.)
- `bean-validator.jar` - Bean validation constraints (`@NotNull`, `@Size`, etc.)
- `jaxb-api.jar` - XML binding annotations (`@XmlRootElement`, etc.)
- `mysql-connector-java-8.0.16.jar` - MySQL JDBC driver
- And other Java EE APIs

These libraries are automatically loaded from the GlassFish installation, so no additional downloads are needed.
