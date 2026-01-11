# Project Management System (PMS)

PMS is a microservices-based Project Management System (Jira-style) built with:
- React + Vite (frontend)
- Node.js + Express (backend services)
- MySQL (user-service)
- MongoDB (team-service + task-service)
- Server-Sent Events (SSE) for real-time UI updates

This repository contains everything needed to run the full stack locally using Docker Compose.

## Contents

- Overview
- Architecture
- Services and ports
- Quickstart (Docker)
- Configuration
- Roles & permissions
- Development workflow
- Troubleshooting
- Documentation

## Overview

Core features:
- Project creation and management
- Project-team assignment (one team per project)
- Kanban-style task board (TODO / IN_PROGRESS / DONE)
- Task assignment to users
- Real-time updates via SSE (projects/teams/tasks)

## Architecture

High-level (containers):

```
Browser (React UI)
   |
   | HTTP + SSE
   v
user-service  (MySQL)        team-service (MongoDB)         task-service (MongoDB)
   :8080                        :8082                        :8083
```

Key design points:
- **JWT authentication** is issued by `user-service` and verified by all services.
- `team-service` is the source of truth for:
  - projects
  - project teams and membership
- `task-service` is the source of truth for:
  - tasks
  - dashboard stats
- **SSE** streams are used to refresh frontend state without manual reload.

## Services and Ports

| Component | URL | Purpose |
|---|---|---|
| Frontend | `http://localhost:5173` | React UI |
| User Service | `http://localhost:8080` | Signup/login/users (MySQL) |
| Team Service | `http://localhost:8082` | Projects + project teams (MongoDB) |
| Task Service | `http://localhost:8083` | Tasks + task SSE (MongoDB) |
| MySQL | `localhost:3307` | Users DB |
| MongoDB | `localhost:27017` | Team/Task DB |

## Quickstart (Docker)

### Prerequisites

- Docker Desktop
- Docker Compose

### Start

```bash
docker-compose up -d --build
```

Open:
- Frontend: `http://localhost:5173`

### View logs

```bash
docker-compose logs -f
```

### Stop

```bash
docker-compose down
```

## Configuration

### JWT secret

All services share the same JWT secret (set in `docker-compose.yml`):

- `JWT_SECRET=my_super_secret_key_123`

### Service-to-service networking

Within Docker networking, services should talk to each other using service names.

Example:
- `task-service` uses `TEAM_SERVICE_URL` (defaults to `http://team-service:8082`).

## Roles & Permissions

The application uses the following roles:

### ADMIN

Can:
- Create/update/delete projects
- Create/update/delete project teams
- Assign a project to a team (one team per project)
- Set team leader
- Add/remove team members
- Create/update/delete tasks in any project

### TEAM_LEADER

Can:
- Create/update/delete tasks for projects they lead
- Manage tasks on the board (including status changes)

### MEMBER

Can:
- View projects where they are part of a project team
- View tasks for those projects

## Development workflow (without Docker)

If you prefer to run services locally:

1) Start databases:

```bash
docker-compose up -d user-db mongodb
```

2) Install dependencies:

```bash
cd user-service && npm install
cd ../team-service && npm install
cd ../task-service && npm install
cd ../frontend && npm install
```

3) Start services (separate terminals):

```bash
cd user-service && npm start
cd team-service && npm start
cd task-service && npm start
cd frontend && npm run dev
```

