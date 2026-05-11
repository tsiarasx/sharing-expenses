# Expense-Sharing App

A MERN (MongoDB, Express, React, Node.js) application to create groups, add expenses, and split costs among members.

## Features

- Create and manage groups
- Add, edit, and delete expenses
- Split expenses evenly or by custom shares
- User authentication with JWT
- REST API backend consumed by a React frontend

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React, Tailwind CSS
- Dev: Nodemon (dev)

## Getting Started

These instructions help you run the project locally using MongoDB Atlas.

### Prerequisites

- Node.js
- npm or yarn
- MongoDB Atlas account (or a running MongoDB instance)

### Local Setup (MongoDB Atlas)

1. Create a MongoDB Atlas cluster and a database user. Obtain the connection string (it looks like `mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority`).
	- In Atlas, add your development IP address to Network Access (or use `0.0.0.0/0` temporarily for development).

2. From the repository root, follow the backend and frontend steps below to run services locally.

#### Backend

1. Change into the backend directory:

```bash
cd backend
npm install
```

2. Create a `.env` file in `backend/` and set the following variables (example):

```
MONGO_URI=<your-mongodb-atlas-connection-string>
PORT=5000
JWT_SECRET=<your-jwt-secret>
```

3. Start the backend:

```bash
npm start
# or for development with auto-reload
npm run dev
```

#### Frontend

1. Change into the frontend directory:

```bash
cd frontend
npm install
```

2. (Optional) Create `.env` in `frontend/` and set the API base URL if you want to override the default:

```
REACT_APP_API_URL=http://localhost:5000
```

3. Start the frontend:

```bash
npm start
```

## Environment Variables

- Backend: `MONGO_URI`, `PORT` (default 5000), `JWT_SECRET`
- Frontend (optional): `REACT_APP_API_URL`

## Helpful Links

- Server entry: [backend/server.js](backend/server.js)
- Frontend source: [frontend/src](frontend/src)

## API

Base URL when running locally: `http://localhost:5000`
