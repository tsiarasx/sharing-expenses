# Expense-Sharing App

A MERN (MongoDB, Express, React, Node.js) application to create groups, add expenses, and split costs among members.

## Features

- Create and manage groups
- Add, edit, and delete expenses
- Split expenses evenly or by custom shares
- User authentication with JWT

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

1. Clone the repository to your local machine:

```bash
git clone <repository_url>
cd <repository_directory>
```

2. Create a MongoDB Atlas cluster and a database user. Obtain the connection string (it looks like `mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority`).
	- In Atlas, add your development IP address to Network Access (or use `0.0.0.0/0` temporarily for development).

#### Backend Setup

1. Change into the backend directory and install dependencies:

```bash
cd backend
npm install
```

2. Create a `.env` file in the `backend/` directory and set the following variables:

```env
MONGO_URI=<your-mongodb-atlas-connection-string>
PORT=5000
JWT_SECRET=<your-jwt-secret>
```

3. Start the backend development server:

```bash
npm run dev
```

#### Frontend Setup

1. Change into the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

2. Start the frontend development server:

```bash
npm start
```

## API

Base URL when running locally: `http://localhost:5000`
