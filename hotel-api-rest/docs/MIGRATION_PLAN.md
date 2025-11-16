# Hotel Reservation System - Modernization Plan

## Overview

Modernize and migrate the hotel reservation web application built with legacy technologies (Java EE, JSP, Servlet, EJB, MySQL) to a more modern architecture and deployment strategy. This migration demonstration highlights some common migration patterns in business today.


---

## Cloud Provider Selection

- [x] AWS
- [ ] GCP
- [ ] Azure
- [ ] Netfify / Vercel
- [ ] Fly.io

There are many options to choose from when considering a cloud provider.  The big three ( AWS, GCP, Azure) are a good match for a 3-tiered Java application.  

Netlify and Vercel would be great for deploying a modern Jamstack application but may not be a good fit for a Java EE application.  Fly.io is built to run containerized applications on lightweight VMs
which may make sense for a lift and shift legacy application but may not be as flexible when it comes to other deployment architectures such as serverless or microservices.

Many other considerations play a role in selecting a cloud platform, including but not limited to: cost optimization, scalability, security, reliability and operational efficiency.

For the purposes of this demonstration Amazon Web Services (AWS) has been selected as the cloud provider for this migration.

---

## Migration Options

- [ ] Lift & Shift (Rehost)
- [ ] Front End Modernization (Backend for Frontend)
- [ ] Refactor/Re-architect (Modern Stack)
- [ ] Serverless Architecture
- [ ] Microservice Architecture

### Option 1: Lift & Shift (Rehost)

**Description:**  
Move the existing application to AWS with minimal changes. Containerize the GlassFish server and MySQL database using Docker/ECS or deploy to EC2 instances.

**Approach:**
- Package GlassFish 4.1.1 + application as Docker containers
- Deploy to AWS ECS (Elastic Container Service) or EC2
- Migrate MySQL to Amazon RDS for MySQL
- Use Application Load Balancer (ALB) for traffic distribution
- Keep existing EJB, JSP, and Servlet architecture intact

**Pros:**
- Fastest migration path (2-4 weeks)
- Lowest risk - minimal code changes required
- Immediate cloud benefits (scalability, backups, monitoring)
- Team familiarity with existing stack
- Cost-effective initial migration

**Cons:**
- Still using legacy Java EE technologies (GlassFish, EJB 3.1)
- Limited scalability improvements
- Maintenance challenges with aging stack
- No modern development practices (CI/CD, microservices)
- Technical debt persists

**Estimated Effort:** 3-4 weeks  
**Estimated Cost:** Low  
**Risk Level:** Low

---

### Option 2: Front End Modernization (Backend for Frontend)

**Description:**  
Modernize the frontend while keeping the existing Java EE backend intact. Create a modern React frontend that communicates with the legacy backend through REST APIs.

**Approach:**
- **Backend:** Keep existing GlassFish + EJB + JSP/Servlet architecture
- **API Layer:** Add REST endpoints to existing servlets or create new REST controllers
- **Frontend:** React SPA deployed to S3 + CloudFront
- **Database:** Keep existing MySQL, optionally migrate to Amazon RDS
- **Authentication:** Implement JWT tokens or session-based auth
- **Deployment:** Backend on EC2/ECS, Frontend on S3 + CloudFront
- **CI/CD:** Separate pipelines for frontend and backend

**Architecture:**
```
React SPA (S3 + CloudFront)
    ↓
API Gateway / Load Balancer
    ↓
GlassFish + EJB + REST APIs (EC2/ECS)
    ↓
MySQL (RDS)
```

**Pros:**
- Modern user experience with SPA
- Gradual migration approach - backend can be modernized later
- Team can learn modern frontend technologies incrementally
- Immediate UX improvements
- API-first approach enables future mobile apps
- Lower risk than full rewrite

**Cons:**
- Still maintaining legacy backend technologies
- Dual deployment complexity (frontend + backend)
- API layer needs to be added to existing servlets
- Limited backend scalability improvements
- Technical debt in backend persists

**Estimated Effort:** 6-8 weeks  
**Estimated Cost:** Medium  
**Risk Level:** Medium

---

### Option 3: Refactor/Re-architect (Modern Stack)

**Description:**  
Complete architectural overhaul to modern, cloud-native stack with API-first design and modern frontend framework.

**Approach:**
- **Backend:** Spring Boot REST API (Java 17+)
- **Frontend:** React SPA (Single Page Application)
- **Database:** Amazon Aurora MySQL (serverless option)
- **API Gateway:** AWS API Gateway for REST endpoints
- **Authentication:** AWS Cognito for user management
- **Storage:** S3 for static assets
- **CDN:** CloudFront for global content delivery
- **Containerization:** Docker + ECS Fargate (serverless containers)
- **CI/CD:** AWS CodePipeline + CodeBuild

**Architecture:**
```
React SPA (S3 + CloudFront)
    ↓
API Gateway
    ↓
Spring Boot REST API (ECS Fargate)
    ↓
Aurora MySQL (Serverless v2)
```

**Pros:**
- Modern, maintainable tech stack
- API-first enables future mobile apps
- Better user experience with SPA
- Serverless components reduce operational overhead
- Easier to add features (payments, notifications)
- Strong developer ecosystem
- Cloud-native scalability

**Cons:**
- Longest migration timeline (10-12 weeks)
- Highest initial cost and effort
- Complete code rewrite required
- Team training needed
- Complex deployment pipeline setup

**Estimated Effort:** 10-12 weeks  
**Estimated Cost:** Medium-High  
**Risk Level:** Medium-High

---

### Option 4: Serverless Architecture

**Description:**  
Migrate to a fully serverless architecture using AWS Lambda functions, API Gateway, and managed services. Break down the monolithic application into serverless functions for each business capability.

**Approach:**
- **API Layer:** AWS API Gateway for REST endpoints
- **Business Logic:** AWS Lambda functions (Java/Node.js/Python)
- **Database:** Amazon DynamoDB for NoSQL or Aurora Serverless v2 for SQL
- **Authentication:** AWS Cognito for user management
- **File Storage:** S3 for static assets and file uploads
- **Frontend:** React SPA deployed to S3 + CloudFront
- **Event Processing:** Amazon EventBridge for async operations
- **Notifications:** Amazon SNS + SES for email/SMS
- **Monitoring:** CloudWatch for logging and metrics

**Architecture:**
```
React SPA (S3 + CloudFront)
    ↓
API Gateway
    ↓
Lambda Functions (Room, Reservation, User, Payment)
    ↓
DynamoDB / Aurora Serverless
    ↓
SNS (Notifications)
```

**Pros:**
- Pay-per-use pricing model
- Automatic scaling based on demand
- No server management overhead
- High availability and fault tolerance
- Event-driven architecture enables loose coupling
- Cost-effective for variable workloads
- Built-in monitoring and logging

**Cons:**
- Cold start latency for Lambda functions
- Vendor lock-in to AWS services
- Complex debugging and testing
- Limited execution time (15 minutes max for Lambda)
- Learning curve for serverless patterns
- Potential higher costs for consistent high traffic
- Stateless nature requires external storage for sessions

**Estimated Effort:** 8-10 weeks  
**Estimated Cost:** Low-Medium  
**Risk Level:** Medium

---

### Option 5: Microservices Architecture

**Description:**  
Break the monolithic application into independently deployable microservices with event-driven architecture.

**Approach:**
- **Room Service:** Manages room inventory (Quarkus + RDS)
- **Reservation Service:** Handles bookings (Quarkus + DynamoDB)
- **User Service:** User management and authentication (Quarkus + Cognito)
- **Payment Service:** Payment processing (Quarkus + external payment APIs)
- **Notification Service:** Email/SMS alerts (Lambda + SNS)
- **API Gateway:** Kong or AWS API Gateway
- **Event Bus:** Amazon EventBridge or SQS
- **Frontend:** React SPA (S3 + CloudFront)
- **Service Mesh:** AWS App Mesh (optional)
- **Containerization:** Docker + ECS Fargate or EKS

**Architecture:**
```
React SPA (S3 + CloudFront)
    ↓
API Gateway
    ↓
┌─────────────────────────────────────────┐
│  Microservices (ECS Fargate/EKS)        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ Room    │ │ Reserve │ │ User    │    │
│  │ Service │ │ Service │ │ Service │    │
│  │(Quarkus)│ │(Quarkus)│ │(Quarkus)│    │
│  └─────────┘ └─────────┘ └─────────┘    │
│  ┌─────────┐ ┌─────────┐                │
│  │ Payment │ │ Notify │                │
│  │ Service │ │ Service │                │
│  │(Quarkus)│ │(Lambda) │                │
│  └─────────┘ └─────────┘                │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  Data Layer                             │
│  RDS + DynamoDB + Cognito + SNS         │
└─────────────────────────────────────────┘
```

**Pros:**
- Maximum scalability and flexibility
- Independent service deployment
- Technology diversity per service
- Fault isolation
- Ideal for large teams
- Quarkus provides fast startup times and low memory footprint
- Native compilation support for optimal performance
- Reactive programming capabilities
- Strong Kubernetes integration

**Cons:**
- Overkill for current application size
- Complex operational overhead
- Distributed system challenges
- Highest cost and timeline
- Requires DevOps maturity

**Estimated Effort:** 16+ weeks  
**Estimated Cost:** High  
**Risk Level:** High







