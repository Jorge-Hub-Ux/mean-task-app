
# MEAN Task App – Backend

This is the backend of the task management application developed as part of a MEAN Stack technical test. Built with **Node.js**, **Express.js**, and **MongoDB**.

---

## Features

- Full CRUD for tasks (`/tasks`)
- Strong validations (title, status, future date, unique tags)
- Advanced filtering (`status`, `priority`, `tags`, date range)
- Task history tracking (`history`)
- Request logging middleware
- Centralized error handling middleware
- MongoDB indexes (`dueDate`, `status`) for efficient queries

---

## Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/youruser/mean-task-backend.git
   cd mean-task-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   Create a `config.env` file with:

   ```
   ATLAS_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mean-task-app
   ```

4. Start the server:

   ```bash
   npm start
   ```

   The server will run at: [http://localhost:5200]

---

## REST API – Endpoints (Summary)
- POST /tasks – Create a new task. Requires title, status, and a future dueDate.

- GET /tasks – Retrieve all tasks. Supports optional filters like status, priority, tags, and dueDate range.

- GET /tasks/:id – Get a task by its ID.

- PUT /tasks/:id – Update a task. Validates fields and logs changes (history).

- DELETE /tasks/:id – Delete a task by ID.

---

## Validation & Safety

- MongoDB JSON Schema validation
- Basic input sanitization
- Centralized error and log handling

---

## Project Structure

```
.
├── database.ts          // MongoDB connection + validation + indexes
├── task.routes.ts       // CRUD routes
├── task.ts              // Task interface + enums
├── server.ts            // Entry point
├── logger.middleware.ts // Logging middleware
├── error.middleware.ts  // Central error handler
```

---

## Key Dependencies

- express
- mongodb
- dotenv
- cors
- typescript

---

## Author

Developed by Jorge Ramirez
