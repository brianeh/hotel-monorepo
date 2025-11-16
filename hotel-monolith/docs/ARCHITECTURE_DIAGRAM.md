# Hotel Reservation System - Visual Architecture Diagrams

This document contains visual diagrams using Mermaid syntax that can be rendered in GitHub, GitLab, and modern markdown viewers.

---

## System Architecture (Layered View)

```mermaid
flowchart TB
    subgraph Client["CLIENT LAYER"]
        Browser["Web Browser
        HTTP/HTTPS"]
    end

    subgraph Presentation["PRESENTATION LAYER
    HotelReservation-war"]
        subgraph JSP["JSP Views"]
            Home_JSP["home.jsp
            Search Form"]
            Available_JSP["available_rooms.jsp
            Room Listings"]
            Reservation_JSP["reservation.jsp
            Booking Form"]
        end
        
        subgraph Servlets["Servlet Controllers"]
            Home_Servlet["Home Servlet
            Room Search and Filtering"]
            Available_Servlet["AvailableRooms Servlet
            Room Selection"]
            Final_Servlet["FinalReservation Servlet
            Booking Submission"]
        end
    end

    subgraph Business["BUSINESS LOGIC LAYER
    HotelReservation-ejb"]
        subgraph EJB["EJB Session Beans"]
            RoomFacade["RoomFacade
            Room Operations"]
            ReservationFacade["ReservationFacade
            Reservation Operations"]
            AbstractFacade["AbstractFacade
            Generic CRUD"]
        end
        
        subgraph Entities["JPA Entities"]
            Room["Room Entity"]
            Reservation["Reservation Entity"]
        end
    end

    subgraph Infrastructure["INFRASTRUCTURE LAYER"]
        subgraph GlassFish["GlassFish Server 4.1.1"]
            ServletContainer["Servlet Container
            Port 8080"]
            EJBContainer["EJB Container
            Session Bean Management"]
            JPAProvider["JPA Provider
            EclipseLink"]
            ConnectionPool["Connection Pool
            HotelReservationPool"]
        end
    end

    subgraph Data["DATA LAYER"]
        MySQL[("MySQL 8.0
        hotel_reservation_system
        Port 3306")]
        RoomTable["room table"]
        ReservationTable["reservation table"]
    end

    Browser <-->|"HTTP Request/Response"| JSP
    JSP <--> Servlets
    Servlets -->|"EJB Injection"| EJB
    EJB -->|"PersistenceContext"| Entities
    Entities -->|"JPA/JDBC"| GlassFish
    GlassFish -->|"JDBC Driver"| MySQL
    MySQL --> RoomTable
    MySQL --> ReservationTable
    RoomFacade -.extends.-> AbstractFacade
    ReservationFacade -.extends.-> AbstractFacade

    style Client fill:#e1f5ff
    style Presentation fill:#fff4e1
    style Business fill:#e8f5e9
    style Infrastructure fill:#f3e5f5
    style Data fill:#fce4ec
```

---

## Request Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant JSP as JSP Views
    participant Servlet as Servlets
    participant Facade as EJB Facades
    participant Entity as JPA Entities
    participant DB as MySQL DB

    Note over User,DB: User searches for available rooms

    User->>Browser: Enter check-in/out dates
    Browser->>JSP: GET /home.jsp
    JSP-->>Browser: Display search form
    
    User->>Browser: Submit search
    Browser->>Servlet: GET /home?dates=...
    
    Servlet->>Facade: roomFacade.findAll()
    Facade->>Entity: Query Room entities
    Entity->>DB: SELECT * FROM room
    DB-->>Entity: Room records
    Entity-->>Facade: List<Room>
    Facade-->>Servlet: Available rooms
    
    Servlet->>Facade: reservationFacade.findAll()
    Facade->>Entity: Query Reservation entities
    Entity->>DB: SELECT * FROM reservation
    DB-->>Entity: Reservation records
    Entity-->>Facade: List<Reservation>
    Facade-->>Servlet: All reservations
    
    Servlet->>Servlet: Filter date conflicts
    Servlet->>JSP: Forward with filtered rooms
    JSP-->>Browser: Display available rooms
    Browser-->>User: Show room list
    
    Note over User,DB: User selects a room
    
    User->>Browser: Click "Book Room"
    Browser->>Servlet: GET /available_rooms?roomId=3
    Servlet->>JSP: Forward to reservation.jsp
    JSP-->>Browser: Display booking form
    Browser-->>User: Show form
    
    Note over User,DB: User submits booking
    
    User->>Browser: Fill form & submit
    Browser->>Servlet: POST /reservation (form data)
    Servlet->>Servlet: Create Reservation object
    Servlet->>Facade: reservationFacade.create(reservation)
    Facade->>Entity: persist(reservation)
    Entity->>DB: INSERT INTO reservation
    DB-->>Entity: Success (ID generated)
    Entity-->>Facade: Persisted entity
    Facade-->>Servlet: Success
    Servlet->>JSP: Forward to confirmation
    JSP-->>Browser: Display success
    Browser-->>User: "Booking confirmed!"
```

---

## Component Relationships

```mermaid
graph LR
    subgraph Presentation["WAR Module"]
        H[Home.java]
        A[AvailableRooms.java]
        F[FinalReservation.java]
    end

    subgraph Business["EJB Module"]
        RF[RoomFacade]
        RFI[RoomFacadeLocal]
        RESF[ReservationFacade]
        RESFI[ReservationFacadeLocal]
        AF[AbstractFacade]
        
        RE[Room Entity]
        RESE[Reservation Entity]
    end

    subgraph Database["MySQL"]
        RT[(room)]
        REST[(reservation)]
    end

    H -->|"EJB"| RFI
    H -->|"EJB"| RESFI
    F -->|"EJB"| RESFI
    A --> H
    F --> A

    RFI -.implements.- RF
    RESFI -.implements.- RESF
    
    RF -->|extends| AF
    RESF -->|extends| AF
    
    RF -->|manages| RE
    RESF -->|manages| RESE
    
    RE -->|maps to| RT
    RESE -->|maps to| REST
    REST -.id_room FK.-> RT

    style Presentation fill:#fff4e1
    style Business fill:#e8f5e9
    style Database fill:#fce4ec
```

---

## Data Model (Entity-Relationship Diagram)

```mermaid
erDiagram
    ROOM ||--o{ RESERVATION : "has many"
    
    ROOM {
        int id PK "Auto-increment"
        text description "Room description"
        int number_of_person "Capacity"
        boolean have_private_bathroom "Has bathroom"
        double price "Price per night"
    }
    
    RESERVATION {
        int id PK "Auto-increment"
        int id_room FK "Room reference"
        date check_in_date "Check-in date"
        date check_out_date "Check-out date"
        varchar full_name "Guest name"
        varchar email "Guest email"
        varchar phone "Contact number"
        text special_request "Special requests"
    }
```

---

## Deployment Diagram

```mermaid
graph TB
    GlassFish["GlassFish Server
    Port 4848 Admin
    Port 8080 HTTP"]
    
    MySQL[("MySQL Server
    Port 3306
    hotel_reservation_system")]
    
    EAR["HotelReservation.ear"]
    
    EJB_JAR["HotelReservation-ejb.jar
    Session Beans
    JPA Entities
    persistence.xml"]
    
    WAR_File["HotelReservation-war.war
    Servlets
    JSP Views
    WEB-INF/lib"]
    
    SessionBeans["RoomFacade
    ReservationFacade"]
    
    JPAEntities["Room Entity
    Reservation Entity"]
    
    Servlets["Home Servlet
    AvailableRooms Servlet
    FinalReservation Servlet"]
    
    JSPs["home.jsp
    available_rooms.jsp
    reservation.jsp"]
    
    JDBC["JDBC Resource: hotel
    Connection Pool:
    HotelReservationPool"]

    GlassFish -->|deploys| EAR
    EAR --> EJB_JAR
    EAR --> WAR_File
    
    EJB_JAR -.contains.-> SessionBeans
    EJB_JAR -.contains.-> JPAEntities
    
    WAR_File -.contains.-> Servlets
    WAR_File -.contains.-> JSPs
    
    SessionBeans -->|uses| JPAEntities
    Servlets -->|calls| SessionBeans
    
    JPAEntities -.uses.-> JDBC
    JDBC -->|MySQL Connector| MySQL
    GlassFish -.manages.-> JDBC

    style GlassFish fill:#fff8e1
    style EAR fill:#e3f2fd
    style EJB_JAR fill:#e8f5e9
    style WAR_File fill:#fce4ec
    style MySQL fill:#f3e5f5
    style JDBC fill:#ede7f6
```

---

## Technology Stack Diagram

```mermaid
graph TB
    Frontend["Frontend Layer
    HTML5, JSP 2.1
    JSTL 1.2, CSS"]
    
    WebLayer["Web Layer
    Servlet 3.1 API
    Apache Commons"]
    
    BusinessLayer["Business Layer
    EJB 3.1, CDI
    Dependency Injection"]
    
    PersistenceLayer["Persistence Layer
    JPA 2.1
    EclipseLink
    Bean Validation"]
    
    DatabaseLayer["Database Layer
    MySQL 8.0
    MySQL Connector 8.0.16"]
    
    GlassFish["GlassFish 4.1.1
    Application Server"]
    
    Java["Java 8 JDK"]
    
    Ant["Apache Ant 1.10.7
    Build Tool"]
    
    Docker["Docker
    DevContainer"]

    Frontend --> WebLayer
    WebLayer --> BusinessLayer
    BusinessLayer --> PersistenceLayer
    PersistenceLayer --> DatabaseLayer
    
    GlassFish -.hosts.-> Frontend
    GlassFish -.hosts.-> WebLayer
    GlassFish -.hosts.-> BusinessLayer
    GlassFish -.provides.-> PersistenceLayer
    
    Java -.runtime.-> GlassFish
    Ant -.builds.-> Frontend
    Ant -.builds.-> WebLayer
    Ant -.builds.-> BusinessLayer
    
    Docker -.contains.-> GlassFish
    Docker -.contains.-> DatabaseLayer

    style Frontend fill:#fff4e1
    style WebLayer fill:#fff8e1
    style BusinessLayer fill:#e8f5e9
    style PersistenceLayer fill:#f3e5f5
    style DatabaseLayer fill:#fce4ec
    style GlassFish fill:#e3f2fd
    style Java fill:#ede7f6
    style Ant fill:#ede7f6
    style Docker fill:#e1f5ff
```

---

## Design Patterns Used

```mermaid
graph TB
    DP["Design Patterns
    in Application"]
    
    MVC["MVC Pattern"]
    MVC_M["Model: JPA Entities"]
    MVC_V["View: JSP Pages"]
    MVC_C["Controller: Servlets"]
    
    Facade["Facade Pattern"]
    Facade_R["RoomFacade"]
    Facade_Res["ReservationFacade"]
    
    DAO["DAO Pattern"]
    DAO_A["AbstractFacade"]
    DAO_C["Generic CRUD"]
    
    DI["Dependency Injection"]
    DI_E["EJB Annotation"]
    DI_C["Container Managed"]
    
    Template["Template Method"]
    Template_B["AbstractFacade Base"]
    Template_S["Subclass Customization"]
    
    FrontC["Front Controller"]
    FrontC_S["Servlet Routing"]
    FrontC_D["View Dispatching"]
    
    DP --> MVC
    DP --> Facade
    DP --> DAO
    DP --> DI
    DP --> Template
    DP --> FrontC
    
    MVC --> MVC_M
    MVC --> MVC_V
    MVC --> MVC_C
    
    Facade --> Facade_R
    Facade --> Facade_Res
    
    DAO --> DAO_A
    DAO --> DAO_C
    
    DI --> DI_E
    DI --> DI_C
    
    Template --> Template_B
    Template --> Template_S
    
    FrontC --> FrontC_S
    FrontC --> FrontC_D
    
    style DP fill:#e3f2fd
    style MVC fill:#fff4e1
    style Facade fill:#e8f5e9
    style DAO fill:#f3e5f5
    style DI fill:#fce4ec
    style Template fill:#fff8e1
    style FrontC fill:#f3e5f5
```

---

## DevContainer Setup Flow

```mermaid
flowchart TD
    Start(["Open Project in
    DevContainer"]) --> Dockerfile
    Dockerfile -->|"1"| InstallJava["Install Java 8 JDK"]
    InstallJava -->|"2"| InstallAnt["Install Apache Ant"]
    InstallAnt -->|"3"| InstallGF["Install GlassFish 4.1.1"]
    InstallGF -->|"4"| DownloadJars["Download JAR Dependencies"]
    DownloadJars -->|"5"| CreateCopyLibs["Create Custom CopyLibs JAR"]
    CreateCopyLibs -->|"6"| InstallMySQL["Install MySQL 8.0"]
    InstallMySQL -->|"7"| PostCreate
    
    PostCreate["postCreateCommand:
    setup.sh"] --> InitDB["Initialize Database"]
    InitDB --> LoadSampleData["Load Sample Data
    10 rooms, 8 reservations"]
    LoadSampleData --> StartGF["Start GlassFish"]
    StartGF --> CreateJDBC["Create JDBC Resources
    Pool and Resource"]
    CreateJDBC --> BuildProps["Generate build.properties"]
    BuildProps --> Ready
    
    Ready["Ready to Develop!"] --> Terminal1
    
    Terminal1["New Terminal Opens"] --> AutoStart["ensure-services.sh"]
    AutoStart -->|"Check MySQL"| MySQLRunning{"MySQL
    Running?"}
    MySQLRunning -->|"No"| StartMySQL["Start MySQL"]
    MySQLRunning -->|"Yes"| CheckGF
    StartMySQL --> CheckGF
    
    CheckGF{"GlassFish
    Running?"}
    CheckGF -->|"No"| StartGF2["Start GlassFish domain1"]
    CheckGF -->|"Yes"| AllReady
    StartGF2 --> AllReady
    
    AllReady["All Services Running!"]
    AllReady --> DevLoop["Development Loop"]
    
    DevLoop --> Deploy["./deploy.sh"]
    Deploy --> AntClean["ant clean"]
    AntClean --> AntDist["ant dist"]
    AntDist --> AsDeploy["asadmin deploy"]
    AsDeploy --> Test["Test Application
    http://localhost:8080"]
    Test -.modify code.-> DevLoop

    style Start fill:#e3f2fd
    style PostCreate fill:#fff8e1
    style Ready fill:#e8f5e9
    style AllReady fill:#c8e6c9
    style DevLoop fill:#ede7f6
```

---

## Build Process

```mermaid
flowchart LR
    Start(["ant dist"]) --> Clean
    
    subgraph Root["Root Build.xml"]
        Clean["Clean all modules"] --> CompileEJB
        CompileEJB["Compile EJB module"] --> CompileWAR
        CompileWAR["Compile WAR module"] --> PackageEJB
    end
    
    subgraph EJB["EJB Build"]
        PackageEJB["Package EJB-JAR"] --> AddEntities["Add JPA Entities"]
        AddEntities --> AddFacades["Add Session Beans"]
        AddFacades --> AddPersistence["Add persistence.xml"]
        AddPersistence --> EJBJar["HotelReservation-ejb.jar"]
    end
    
    subgraph WAR["WAR Build"]
        EJBJar --> PackageWAR["Package WAR"]
        PackageWAR --> AddServlets["Add Servlet classes"]
        AddServlets --> AddJSP["Add JSP views"]
        AddJSP --> AddLibs["Add WEB-INF/lib
        JSTL, Commons-Codec"]
        AddLibs --> WARFile["HotelReservation-war.war"]
    end
    
    subgraph EAR["EAR Assembly"]
        EJBJar --> BuildEAR["Build EAR"]
        WARFile --> BuildEAR
        BuildEAR --> AddAppXML["Add application.xml"]
        AddAppXML --> EARFile["HotelReservation.ear"]
    end
    
    EARFile --> Deploy["Deploy to GlassFish"]
    Deploy --> Deployed(["Deployed!"])

    style Root fill:#e3f2fd
    style EJB fill:#e8f5e9
    style WAR fill:#fff8e1
    style EAR fill:#f3e5f5
```

---

## How to View These Diagrams

### 🔍 Need to Zoom?

**Quick Options:**
- **Best zoom:** Use [Mermaid Live Editor](https://mermaid.live/) - copy/paste diagrams for full zoom controls
- **In preview:** `Ctrl/Cmd + Plus` to zoom, `Ctrl/Cmd + 0` to reset
- **Export:** SVG format for infinite zoom quality

### GitHub / GitLab
These Mermaid diagrams will automatically render when viewing this file on:
- ✅ GitHub (native support)
- ✅ GitLab (native support)
- ✅ Azure DevOps (with extension)

### VS Code / Cursor
Install the **Mermaid Preview** extension:
```bash
code --install-extension bierner.markdown-mermaid
# OR for better zoom:
code --install-extension vstirbu.vscode-mermaid-preview
```

Then use `Ctrl/Cmd + Plus` for browser zoom, or right-click on diagram for preview.

### Online Viewers (Best for Zooming!)
- [Mermaid Live Editor](https://mermaid.live/) - **Recommended** for zoom & export
- [Mermaid Chart](https://www.mermaidchart.com/)

### Documentation Tools
- ✅ Docusaurus (native support)
- ✅ MkDocs (with plugin)
- ✅ Sphinx (with extension)
- ✅ Jekyll (with plugin)

---

**See Also:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed text-based architecture documentation
- [README.md](README.md) - Project overview and quick start
- [SETUP.md](SETUP.md) - Complete setup instructions

---

**Document Version:** 1.0  
**Last Updated:** October 21, 2025  
**Diagram Format:** Mermaid (v10+)

