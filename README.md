# Project Management System (PMS)

## Services
- **User Service (Port 8080):** Handles Registration, Admin Activation, and JWT Login. (MySQL)
- **Team Service (Port 8082):** Handles Team creation and member management. (MongoDB)

## How to run
1. Run `docker-compose up -d` to start the databases.
2. Go into each service folder and run `npm install`.
3. Start services with `node index.js`.

