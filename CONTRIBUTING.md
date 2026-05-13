# Contributing Guide

Welcome — this document explains the repository layout, how to run the app locally, and how to add features safely.

## Quick start (local development)

Prerequisites: Node.js (>=16), npm or yarn, and a MongoDB instance (local or cloud).

### Backend
- Install dependencies and start the server:

```bash
cd backend
npm install
# Create a `.env` file (copy from `.env.example` if present) and set at minimum:
# MONGO_URI, JWT_SECRET
node server.js    # or `npm start` or `npm run dev` if configured
```

Backend entrypoint: `backend/server.js`. Database connection is in `backend/config/db.js`.

### Frontend
- Install dependencies and start the React app:

```bash
cd frontend
npm install
npm start
```

Default dev URL is typically `http://localhost:3000` (check the terminal output).

## Project structure (current)

### Backend
- `backend/server.js` — application entry and route mounting.
- `backend/config/db.js` — MongoDB connection helper.
- `backend/controllers/` — request handlers (e.g. `authController.js`, `groupController.js`).
- `backend/models/` — Mongoose schemas (`User.js`, `Group.js`, `Expense.js`).
- `backend/routes/` — Express route definitions (`authRoutes.js`, `groupRoutes.js`).
- `backend/middleware/` — auth and error middleware (`authMiddleware.js`, `errorMiddleware.js`).
- `backend/utils/` — helper utilities (`generateToken.js`).

### Frontend
- `frontend/src/index.js` — React bootstrap.
- `frontend/src/App.js` — main app and route definitions.
- `frontend/src/pages/` — page components (`Dashboard.js`, `GroupDetails.js`, `Login.js`, `Register.js`, `Profile.js`).
- `frontend/src/services/` — API wrappers (`authService.js`, `groupService.js`, `expenseService.js`).
- `frontend/src/context/` — React Context providers (`AuthContext.js`, `GroupContext.js`).

Note: There is currently no `frontend/src/components` directory in this repository. Shared or reusable UI components are currently colocated in `src/pages/` or can be added under `frontend/src/components/` if you want to factor them out in future work.

## Adding a new backend endpoint
1. Add route(s) in `backend/routes/` (follow existing route patterns).
2. Implement controller logic in `backend/controllers/`.
3. Add or update Mongoose models in `backend/models/` if data shape changes.
4. Protect routes with `backend/middleware/authMiddleware.js` when needed.
5. Test endpoints with Postman / curl and add automated tests where appropriate.

When adding routes, register them in `server.js` (or wherever routes are mounted).

## Adding a new frontend page
1. Create a new component in `frontend/src/pages/`.
2. Import and add a `<Route>` in `frontend/src/App.js`.
3. Add navigation in `frontend/src/components/Navbar.js` if it should be globally accessible.
4. Add API calls to `frontend/src/services/` and update context/providers if the page requires global state.
5. Add unit/integration tests and basic accessibility checks.

## Branches, commits, and PRs
- Commit messages: short subject, optional body.
- Develope on your dedicated branch with your name and i will handle the merge to the developing and then to main

## Environment variables
- Typical variables used by this app:
  - `MONGO_URI` — MongoDB connection string
  - `JWT_SECRET` — secret for signing auth tokens
  - `PORT` — backend port (optional)


