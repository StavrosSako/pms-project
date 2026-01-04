# Project Management System (PMS)

A microservices-based Project Management System similar to Jira, built with Docker, React, Express, MySQL, and MongoDB.

## Architecture

### Services
- **User Service (Port 8080):** Handles Registration, Admin Activation, and JWT Login. (MySQL)
- **Team Service (Port 8082):** Handles Team/Project creation and member management. (MongoDB)
- **Task Service (Port 8083):** Handles Task management, comments, and dashboard statistics. (MongoDB)
- **Frontend (Port 5173):** React application with Vite

### Databases
- **MySQL (Port 3307):** User management database
- **MongoDB (Port 27017):** Team and Task databases

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Then open http://localhost:5173 in your browser.

### Manual Setup

1. Start databases:
   ```bash
   docker-compose up -d user-db mongodb
   ```

2. Install dependencies for each service:
   ```bash
   cd user-service && npm install
   cd ../team-service && npm install
   cd ../task-service && npm install
   cd ../frontend && npm install
   ```

3. Start services (in separate terminals):
   ```bash
   # User Service
   cd user-service && npm start
   
   # Team Service
   cd team-service && npm start
   
   # Task Service
   cd task-service && npm start
   
   # Frontend
   cd frontend && npm run dev
   ```

## First Time Setup

1. **Register a user** at http://localhost:5173/signup
2. **Activate the user** (see TESTING_GUIDE.md for details)
3. **Login** and start using the application

## Documentation

- See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing instructions
- API endpoints are documented in each service's route files

## Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS, React Router
- **Backend:** Express.js, Node.js
- **Databases:** MySQL 8.0, MongoDB
- **Authentication:** JWT
- **Containerization:** Docker, Docker Compose

