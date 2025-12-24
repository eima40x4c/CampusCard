# How to Run the CampusCard Project

## Prerequisites

- Java 17 or higher
- Maven 3.8+
- Docker and Docker Compose
- Node.js 20+ (for frontend)
- npm 10+ (comes with Node.js 20)

## Quick Start Guide

### Step 1: Start Infrastructure Services (Docker)

```bash
cd CampusCard
docker compose up -d
```

This starts:

- **PostgreSQL** on port 5432
- **MinIO** on ports 9000 (API) and 9001 (Console)

**Verify services are running:**

```bash
docker compose ps
```

Both services should show status "Up" and "healthy".

### Step 2: Run the Spring Boot Backend

```bash
cd CampusCard
mvn spring-boot:run
```

**Or if you prefer to build first:**

```bash
mvn clean install
mvn spring-boot:run
```

The backend will:

- Run database migrations automatically (including the new V6 migration with faculties/departments)
- Start on port **8080**
- Be available at: `http://localhost:8080`

**Wait for the startup message:**

```
Started CampusCardApplication in X.XXX seconds
```

### Step 3: Run the React Frontend

**First time setup (if not done already):**

```bash
cd frontend
npm install
```

**Start the development server:**

```bash
cd frontend
npm run dev
```

The frontend will start on port **5173** (Vite default) and be available at:

- `http://localhost:5173`

**Note:** If you're using Node.js via nvm, make sure to use Node 20+:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
```

## Access Points

### Backend API

- **Base URL:** `http://localhost:8080`
- **API Documentation:** Check `API_REFERENCE.md` in the CampusCard folder

### Frontend

- **URL:** `http://localhost:5173`

### MinIO Console (File Storage)

- **URL:** `http://localhost:9001`
- **Username:** `minioadmin`
- **Password:** `minioadmin123`

## Test Users

### Admin User

- **Email:** `admin@eng.psu.edu.eg`
- **Password:** `admin123`
- **Role:** ADMIN

### Test Student

- **Email:** `test@eng.psu.edu.eg`
- **Password:** `password123`
- **Role:** STUDENT
- **Status:** APPROVED

## Testing the New Features

### 1. Test Profile Visibility Options

1. **Login as a student** (`test@eng.psu.edu.eg` / `password123`)
2. **Go to Profile page** and click "Edit Profile"
3. **Change visibility** to one of:
   - **Public** - Visible to everyone (including non-authenticated users)
   - **Students Only** - Visible to authenticated users and admins
   - **Private** - Visible only to you and admins
4. **Save changes**

### 2. Test Public Profile Access

1. **Open an incognito/private browser window** (to test unauthenticated access)
2. **Navigate to:** `http://localhost:5173/profile/1` (or any user ID)
3. **For PUBLIC profiles:** You should see the profile
4. **For STUDENTS_ONLY profiles:** You should see "This profile is for students only"
5. **For PRIVATE profiles:** You should see "This profile is private"

### 3. Test New Faculties and Departments

The new Port Said University faculties and departments have been added via migration V6. You can verify by:

1. **Sign up a new user** and check the faculty/department dropdowns
2. **Check the database:**
   ```bash
   docker exec -it campuscard-postgres psql -U campuscard_user -d campuscard
   ```
   Then run:
   ```sql
   SELECT COUNT(*) FROM faculties;
   SELECT COUNT(*) FROM departments;
   ```

## Common Commands

### Stop Services

```bash
# Stop Docker services
cd CampusCard
docker compose down

# Stop backend (Ctrl+C in terminal)

# Stop frontend (Ctrl+C in terminal)
```

### View Logs

```bash
# Docker services logs
docker compose logs -f

# Specific service
docker compose logs -f postgres
docker compose logs -f minio
```

### Reset Database (⚠️ Deletes all data)

```bash
docker compose down -v
docker compose up -d
# Then restart the backend to run migrations
```

### Check Database Connection

```bash
docker exec -it campuscard-postgres psql -U campuscard_user -d campuscard -c "SELECT version();"
```

### Query Users Table

To view all users in the database, run:

```bash
docker exec -it campuscard-postgres psql -U campuscard_user -d campuscard -c "SELECT * FROM users;"
```

## Troubleshooting

### Backend won't start

- Check if PostgreSQL is running: `docker compose ps`
- Check if port 8080 is available: `lsof -i :8080`
- Check backend logs for errors

### Frontend won't start

- Ensure Node.js 20+ is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check if port 5173 is available: `lsof -i :5173`

### Database migration errors

- Check Flyway migration status in backend logs
- Verify PostgreSQL is healthy: `docker compose ps`
- Check database connection in `application.properties`

### MinIO connection issues

- Verify MinIO is running: `docker compose ps`
- Check MinIO console at `http://localhost:9001`
- Verify credentials in `application.properties`

## Project Structure

```
WebProject/
├── CampusCard/          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/    # Java source code
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/  # Flyway migrations
│   │   └── test/        # Tests
│   ├── pom.xml
│   └── docker-compose.yml
└── frontend/            # React Frontend
    ├── src/
    ├── package.json
    └── vite.config.js
```

## Next Steps

1. ✅ Start Docker services
2. ✅ Run backend
3. ✅ Run frontend
4. ✅ Test profile visibility features
5. ✅ Test new faculties/departments in signup form
6. ✅ Verify all migrations ran successfully

Happy coding! 🚀
