# CampusCard - University Campus Management System

A comprehensive Spring Boot REST API for managing university campus operations, including user authentication, profile management, and file uploads.

## 🎯 Features

### 1. User Authentication & Authorization

Complete JWT-based authentication system with role-based access control:

- JWT authentication with Bearer token support (HS384 algorithm, 24-hour expiration)
- Secure password hashing using BCrypt (strength 12)
- Role-based access control (STUDENT, ADMIN)
- User registration with multipart/form-data including national ID scan file upload
- Flexible login: supports both email and national ID as identifiers
- Automatic profile creation upon successful signup
- Custom email validation: enforces @eng.psu.edu.eg domain using @PsuEmail annotation

### 2. Profile Management

Comprehensive user profile system with privacy controls:

- Full CRUD operations for user profiles
- Profile visibility controls (PUBLIC/PRIVATE)
- Status-based privacy: PENDING and REJECTED users are invisible to other students
- User information includes:
  - First name, last name, birth date
  - Bio and contact information
  - Social media links (LinkedIn, GitHub)
  - Academic details (faculty, department, year)
  - Profile photo and national ID scan
  - Interests and skills
- View other users' profiles with automatic privacy enforcement
- APPROVED users with PUBLIC visibility are searchable and visible to all

### 3. File Upload System

Secure object storage with MinIO integration:

- MinIO object storage for scalable file management
- Authenticated file uploads (requires valid JWT token)
- Support for profile photos and national ID scans
- File validation (type, size, format)
- User-specific file organization in MinIO buckets
- Automatic file URL generation for frontend access

### 4. Database & Data Management

PostgreSQL database with automated migration system:

- PostgreSQL 16 database with JPA/Hibernate ORM
- Flyway database migrations for version control (V1 through V4)
- Comprehensive test data seeding for development
- Testcontainers integration for isolated testing environment
- Support for faculties, departments, and academic structure

### 5. Admin Review & Dashboard

Complete admin workflow for user verification and approval:

- Admin-only endpoints protected by role-based access control
- Email verification gate enforced before user approval
- Manual review workflow for comparing profile photos with national ID scans
- Dashboard statistics: users by status, role, email verification status

**Email Verification Flow:**

1. User registers → `status=PENDING`, `emailVerified=false`
2. Admin views pending users and triggers verification: `POST /api/admin/users/{userId}/send-verification`
3. System generates UUID token and stores it with timestamp in database
4. **Email Sending** (configurable via `app.testing.mode`):
   - **Testing Mode** (`app.testing.mode=true`): Returns token in API response for manual verification (current default)
   - **Production Mode** (`app.testing.mode=false`): Sends real email to user with verification link
5. User verifies email:
   - **Testing**: Admin manually calls `POST /api/admin/users/{userId}/verify-email/{token}`
   - **Production**: User clicks link in email → Frontend calls verification endpoint
6. Token validated (24-hour expiration) → `emailVerified=true`
7. Admin reviews profile and national ID, then approves → `status=APPROVED`

**Email Configuration**: See `EMAIL_SETUP_GUIDE.md` for complete setup instructions including Gmail/SMTP configuration.

**Privacy Rules:**

- Profile visibility is controlled by user `status` (PENDING/REJECTED/APPROVED)
- PENDING users: Profile visible only to self and admins
- REJECTED users: Profile visible only to self and admins
- APPROVED users: Profile visibility based on user's PUBLIC/PRIVATE setting
- Email verification is a prerequisite for approval, not for profile access

### 6. Testing Infrastructure

Comprehensive test suite with 58 tests all passing:

- **58/58 tests passing** ✅
  - ProfileControllerTest: 14/14 tests (includes status-based privacy)
  - FileUploadControllerTest: 10/10 tests
  - LoginControllerTest: 6/6 tests
  - UserControllerTest: 5/5 tests
  - AdminControllerTest: 10/10 tests
  - MinioServiceTest: 13/13 tests
- Java HttpClient-based integration tests (resolves RestAssured CSRF conflicts)
- Testcontainers for PostgreSQL and MinIO isolation
- Detailed test documentation available in `TESTS.md`

### 7. Exception Handling

Global exception handling with consistent error responses:

- Global exception handler using @RestControllerAdvice
- Consistent JSON error response format
- Proper HTTP status codes (400 for validation, 403 for authorization, 404 for not found)
- Field-level validation error messages for debugging
- Custom exceptions for domain-specific errors

## 🏗️ Architecture

### Technology Stack

- **Framework**: Spring Boot 4.0.0
- **Language**: Java 17
- **Database**: PostgreSQL 16.10
- **Object Storage**: MinIO
- **Security**: Spring Security + JWT
- **Testing**: JUnit 5, Testcontainers
- **Build Tool**: Maven

### Project Structure

```
src/
├── main/
│   ├── java/com/abdelwahab/CampusCard/
│   │   ├── config/          # Security, JWT configuration
│   │   ├── controller/      # REST endpoints
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── exception/       # Global exception handling
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Data access layer
│   │   ├── security/        # JWT authentication filter
│   │   └── service/         # Business logic
│   └── resources/
│       ├── application.properties
│       └── db/migration/    # Flyway SQL scripts (V1-V4)
└── test/
    └── java/com/abdelwahab/CampusCard/
        ├── ProfileControllerTest.java
        ├── FileUploadControllerTest.java
        ├── LoginControllerTest.java
        ├── UserControllerTest.java
        ├── AdminControllerTest.java
        └── MinioServiceTest.java

Documentation:
├── README.md            # Project overview (this file)
├── TESTS.md            # Comprehensive test documentation
└── API_REFERENCE.md    # Frontend API guide
```

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.8+
- Docker and Docker Compose (for PostgreSQL and MinIO)

### Running with Docker Compose

1. **Start infrastructure services:**

```bash
docker-compose up -d
```

This starts:

- PostgreSQL on port 5432
- MinIO on port 9000 (API) and 9001 (Console)

2. **Run the application:**

```bash
mvn spring-boot:run
```

3. **Access MinIO Console:**

- URL: http://localhost:9001
- Username: minioadmin
- Password: minioadmin

### Running Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=ProfileControllerTest

# Run specific test method
mvn test -Dtest=ProfileControllerTest#shouldGetCurrentUserProfile
```

## 📋 API Endpoints

### Authentication

- `POST /api/signup` - Register new user (multipart/form-data with national ID scan file)
- `POST /api/login` - Login with email/national ID

### Profile Management

- `GET /api/profile` - Get current user's profile
- `GET /api/profile/{userId}` - Get another user's profile (respects visibility & approval status)
- `PUT /api/profile` - Update current user's profile

### File Uploads

- `POST /api/profile/photo` - Upload profile photo
- `POST /api/profile/national-id-scan` - Upload national ID scan

### Admin Endpoints (Admin role required)

- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users/pending` - List pending approvals
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{userId}` - Get user details
- `POST /api/admin/users/{userId}/approve` - Approve user
- `POST /api/admin/users/{userId}/reject` - Reject user with reason
- `POST /api/admin/users/{userId}/send-verification` - Send email verification token
- `POST /api/admin/users/{userId}/verify-email` - Verify email with token

**Note**: See `API_REFERENCE.md` for detailed request/response examples.

## 🔧 Configuration

### Application Properties

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/campuscard
spring.datasource.username=postgres
spring.datasource.password=postgres

# MinIO
minio.endpoint=http://localhost:9000
minio.access-key=minioadmin
minio.secret-key=minioadmin
minio.bucket-name=uploads

# JWT
jwt.secret=your-256-bit-secret

# Email Configuration (for production)
# Testing mode (default): Returns token in API response
# Production mode: Sends real emails via SMTP
app.testing.mode=true
app.frontend.url=http://localhost:3000

# SMTP settings (required when app.testing.mode=false)
# spring.mail.host=smtp.gmail.com
# spring.mail.port=587
# spring.mail.username=your-email@gmail.com
# spring.mail.password=your-app-password
jwt.expiration=86400000

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

## 🧪 Testing Architecture

### Why Java HttpClient Instead of RestAssured?

We encountered a critical issue with RestAssured 5.3.1's built-in CSRF filter:

- **Problem**: RestAssured's CSRF filter throws `NullPointerException` when handling Bearer token authentication with GET requests
- **Root Cause**: Internal RestAssured filter conflicts with Spring Security's JWT authentication
- **Solution**: Migrated to Java's built-in `HttpClient` (Java 11+) for integration tests

### Test Structure

```java
// Example test with HttpClient
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create(baseUrl + "/api/profile"))
    .header("Authorization", "Bearer " + authToken)
    .GET()
    .build();

HttpResponse<String> response = httpClient.send(request,
    HttpResponse.BodyHandlers.ofString());
```

### Key Testing Features

- `@LocalServerPort` for dynamic port binding
- Testcontainers for PostgreSQL and MinIO isolation
- Multipart file upload testing with proper content-type headers
- JSON response validation with Jackson ObjectMapper

## 🔐 Security Features

### JWT Authentication

- Tokens contain: userId, email, role
- Algorithm: HS384
- Expiration: 24 hours
- Header format: `Authorization: Bearer <token>`

### Endpoint Security

- Public endpoints: `/api/signup`, `/api/login`
- All other endpoints require authentication
- Profile visibility controls (PUBLIC/PRIVATE)
- **Status-based access control**: Only APPROVED users are visible to others
  - PENDING users: Only visible to themselves and admins
  - REJECTED users: Only visible to themselves and admins
  - APPROVED users: Visible based on their visibility setting
- Admin-only endpoints: `/api/admin/**` (requires ADMIN role)

### Password Security

- BCrypt hashing with strength 12
- Passwords never stored in plain text
- Secure password validation

## 📝 Test Data

Default test users (created via Flyway migrations):

### Approved Student

```
Email: test@eng.psu.edu.eg
Password: password123
National ID: 12345678901234
First Name: Test
Last Name: User
Birth Date: 1995-01-01
Role: STUDENT
Status: APPROVED
Email Verified: true
```

### Admin User

```
Email: admin@eng.psu.edu.eg
Password: admin123
National ID: 98765432109876
First Name: Admin
Last Name: User
Birth Date: 1990-01-01
Role: ADMIN
Status: APPROVED
Email Verified: true
```

### Pending Student (Hidden from others)

```
Email: pending@eng.psu.edu.eg
Password: password123
National ID: 11111111111111
First Name: Pending
Last Name: User
Birth Date: 1999-01-01
Role: STUDENT
Status: PENDING
Email Verified: false
```

### Rejected Student (Hidden from others)

```
Email: rejected@eng.psu.edu.eg
Password: password123
National ID: 22222222222222
First Name: Rejected
Last Name: User
Birth Date: 1999-01-01
Role: STUDENT
Status: REJECTED
Email Verified: false
Rejection Reason: Invalid national ID photo
```

## 🐛 Known Issues & Solutions

### Issue 1: RestAssured CSRF Filter NPE

- **Error**: `NullPointerException` in `CsrfFilter.groovy:70`
- **Solution**: Use Java HttpClient instead of RestAssured for authenticated endpoints
- **Status**: ✅ Resolved

### Issue 2: Validation Errors Returning 403

- **Error**: Bean validation errors returned 403 instead of 400
- **Solution**: Added `GlobalExceptionHandler` with `@RestControllerAdvice`
- **Status**: ✅ Resolved

### Issue 3: TestRestTemplate Not Available

- **Error**: `TestRestTemplate` class not found in Spring Boot 4
- **Solution**: Use Java HttpClient for integration tests
- **Status**: ✅ Resolved

## 📈 Next Steps & Future Work

### 1. Frontend Development (Critical Priority)

**Admin Dashboard UI:**

- User approval/rejection interface with side-by-side photo comparison
- Real-time system statistics dashboard
- Email verification management interface
- Bulk operations for approving/rejecting multiple users
- User search and filtering capabilities

**Student Portal UI:**

- Profile management interface with form validation
- Profile photo upload with preview and cropping
- Browse other students' profiles with privacy respect
- Search and discovery features
- Responsive design for mobile devices

### 2. Security Enhancements (High Priority)

**Account Security:**

- Account lockout after 5 failed login attempts (15-minute lockout)
- Redis-based counter tracking for login attempts
- Progressive backoff for repeat offenders
- Rate limiting on authentication endpoints using Bucket4j + Redis
- IP-based throttling for suspicious activity (5 requests/minute for login)

**Password Management:**

- Password reset functionality with email-based flow
- Secure token generation (UUID with hashing)
- Single-use tokens with 15-30 minute expiration
- Password strength requirements enforcement

**Advanced Authentication:**

- Email verification enforcement (block unverified users from login)
- Automatic email sending on registration
- Resend verification option for users
- Two-factor authentication (2FA) with TOTP (Google Authenticator)
- Backup codes for 2FA recovery

### 3. Search & Discovery (High Priority)

**User Search:**

- Search by name, email, national ID
- Filter by faculty, department, year
- Filter by interests and skills
- Privacy-aware search (only APPROVED + PUBLIC users visible)
- Advanced search with cursor-based pagination
- Sortable results (by name, year, faculty)
- Search result highlighting for better UX

### 4. API Documentation (High Priority)

**Documentation Tools:**

- API Reference for frontend developers (completed)
- Swagger/OpenAPI 3.0 integration with interactive explorer
- Auto-generated documentation from Spring annotations
- Try-it-out functionality in Swagger UI
- Postman collection export for easy testing
- API versioning strategy (v1, v2 paths)

### 5. Email System (Medium Priority)

**Email Integration:**

- Email service integration (SMTP/SendGrid/AWS SES)
- Email templates for welcome, verification, approval/rejection, password reset
- Email queue with retry mechanism for failed deliveries
- Email delivery tracking and status monitoring
- Responsive HTML email templates

### 6. Enhanced Profile Features (Medium Priority)

**Profile Improvements:**

- Profile completeness indicator (percentage calculation)
- Profile verification badges (verified email, verified ID)
- Skills and endorsements system
- Academic achievements showcase section
- Activity history/timeline
- Profile views counter ("who viewed my profile" feature)

### 7. Social Features (Low Priority)

**User Interaction:**

- Friend/connection system with requests
- Follow/unfollow users functionality
- News feed/activity stream
- Direct messaging between connected users
- Real-time notifications system (WebSocket)
- Groups and communities (organized by faculty/interests)

### 8. File Management Improvements (Medium Priority)

**File Processing:**

- Profile photo cropping and resizing on upload
- Image optimization and compression (reduce file sizes)
- Automatic thumbnail generation for faster loading
- Multiple photo uploads (profile gallery)
- File deletion endpoint with cleanup
- CDN integration for global performance
- Support for additional file types (PDFs for documents)

### 9. Performance Optimization (Medium Priority)

**Caching Layer:**

- Redis caching for user profiles (5-minute TTL)
- Cache dashboard statistics to reduce database load
- Cache search results for frequently searched queries

**Database Optimization:**

- Add indexes for frequently queried columns (email, nationalId, status)
- Optimize N+1 queries with JOIN FETCH
- Database connection pooling tuning for better throughput
- Lazy loading for large collections
- Async processing for heavy operations (email sending, file processing)

### 10. Monitoring & Observability (Medium Priority)

**Application Monitoring:**

- Spring Boot Actuator integration with health checks
- Metrics endpoint for monitoring CPU, memory, database connections
- Custom business metrics (registrations per day, approval rates)
- Structured JSON logging (Logback/Log4j2)
- Error tracking integration (Sentry or ELK Stack)
- Performance monitoring with APM tools
- Audit logging for sensitive operations (approvals, rejections, role changes)

### 11. Deployment & DevOps (High Priority)

**Containerization:**

- Multi-stage Dockerfile for optimized Spring Boot image
- Docker Compose for full stack (app + PostgreSQL + MinIO + Redis)
- Environment-specific configurations (dev, staging, production)

**CI/CD Pipeline:**

- GitHub Actions workflow for automated testing
- Automated testing on pull requests
- Automated deployment to staging and production environments
- Code quality checks with SonarQube
- Security scanning for dependencies

**Infrastructure:**

- Kubernetes manifests for production orchestration (optional)
- Database migration strategy for zero-downtime updates
- Automated backup and disaster recovery plan
- Blue-green or rolling deployment strategy for zero downtime
- Load balancer configuration for high availability

## 🤝 Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement feature with tests
3. Ensure all tests pass: `mvn test`
4. Submit pull request

### Code Standards

- Follow Java naming conventions
- Write self-documenting code with comments
- Add tests for new features
- Update README for significant changes

## 📄 License

This project is created for educational purposes.

## 👥 Authors

- Mohamed Abdelwahab

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- Testcontainers for simplified integration testing
- MinIO for object storage solution
