# Hotel Reservation System (RESTful API)

**Modernization Demonstration Repository**

This repository demonstrates a **RESTful API modernization strategy** for the legacy Hotel Reservation System. Originally copied from **[hotel-monolith](https://github.com/brianeh/hotel-monolith)** (link to original repository), this project showcases how to add modern REST API capabilities to existing Java EE applications **without requiring major infrastructure upgrades**.

**Modernization Goal**: Decouple the frontend from backend by adding RESTful API endpoints while preserving the existing JSP/Servlet web interface and maintaining compatibility with Java 8, GlassFish 4, and MySQL.

[![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Note: This repository is part of the Hotel Modernization umbrella project: [hotel-modernization](https://github.com/brianeh/hotel-modernization).

---

## 🔄 Migration Strategy

### Approach
This modernization uses **JAX-RS (Java API for RESTful Web Services)** to add REST API capabilities to the existing Java EE 7 application. The strategy leverages the current technology stack without requiring upgrades to Java version, application server, or database.

### Key Benefits
- **Zero new dependencies**: Uses existing Java EE 7 APIs
- **Non-disruptive**: Existing JSP/Servlet UI continues to work unchanged
- **Reuses existing EJBs**: No business logic duplication
- **Compatible stack**: Works with Java 8 and GlassFish 4
- **Prepared entities**: Entities already have `@XmlRootElement` for JSON/XML serialization

### Implementation Status
✅ **Complete Implementation Guide Available**

For detailed technical implementation, API endpoints, code examples, and testing instructions, see:
- **[RESTful API Implementation Guide](docs/api/MODULES_AND_REST_API.md)** - Complete technical documentation

🚧 **RESTful API Implementation In Progress**

---

## 🚀 DevContainer Quick Start

**This project now includes full DevContainer support for instant setup!**

### Setup in 3 Steps:
1. **Open in DevContainer** (VS Code/Cursor with DevContainers extension)
2. Wait ~7 minutes for automatic setup (Java, Ant, GlassFish, MySQL, database)
3. Deploy: `./deploy.sh`
4. Access: http://localhost:8080/HotelReservation-war/

**That's it! Everything is configured automatically.**

### Documentation:
- **[QUICKSTART.md](docs/QUICKSTART.md)** - Quick reference and daily workflow
- **[SETUP.md](docs/SETUP.md)** - Comprehensive setup guide and troubleshooting
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Complete system architecture documentation
- **[ARCHITECTURE_DIAGRAM.md](docs/ARCHITECTURE_DIAGRAM.md)** - Visual architecture diagrams (Mermaid)
- **[RESTful API Implementation Guide](docs/api/MODULES_AND_REST_API.md)** - Complete REST API modernization documentation
- **[.devcontainer/README.md](.devcontainer/README.md)** - DevContainer technical details

### Key Commands:
```bash
./status.sh   # Check all services status
./deploy.sh   # Build and deploy application
```

---

### Features 💡
* Very simple to use (UX Design)
* Responsive design
* Online hotel reservation

### Report
* [Architecture and Software Development - PDF Version](Report.pdf)

### Screenshoot
Home           |
:--------------:|
![home - screenshoot](screenshots/home.PNG) |


Available rooms    |
:-----------------:|
![available rooms - screenshoot](screenshots/availableRooms.PNG) |

Reservation       |
:----------------:|
![reservation - screenshoot](screenshots/finalReservation.PNG) |

### Used Languages
* Java
* HTML
* CSS
* JavaScript

### Used Technologies & Frameworks
* JavaEE (JSP, Servlet, EJB)
* JAX-RS (RESTful Web Services)
* Bootstrap

### Used Database
* MySQL

### Used server
* GlassFish 4.1.1

### Installation 🔌

**🌟 Recommended: DevContainer (Easiest)**
1. Clone this repository
2. Open in VS Code/Cursor with DevContainers extension
3. Wait for automatic setup (~7 minutes)
4. Run: `./deploy.sh`
5. Access: http://localhost:8080/HotelReservation-war/

**See [QUICKSTART.md](docs/QUICKSTART.md) for DevContainer details.**

**Manual Installation (Traditional):**
1. Press the **Fork** button (top right the page) to save copy of this project on your account.
2. Download the repository files (project) from the download section or clone this project:
   ```
   git clone https://github.com/HouariZegai/HotelReservationSystem.git
   ```
3. Download GlassFish 4.1+ or any other server (support EJB) like JBoss, and add it to the IDE.
4. Import & execute the SQL queries from the Database folder to the MySQL database.
5. Import the project in NetBeans or any other IDE.
6. Deploy & Run the application :D

