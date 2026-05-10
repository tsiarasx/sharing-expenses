# Expense-Sharing App

A MERN stack application for sharing and splitting expenses among friends, family, or colleagues.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js
* npm or yarn
* MongoDB
* Docker and Docker Compose (optional, for containerized setup)

### Running with Docker

1. Ensure Docker and Docker Compose are installed and running.
2. Clone the repository.
3. Run \`docker-compose up -d --build\` in the root directory.
4. The frontend will be available at \`http://localhost:3000\` and the backend at \`http://localhost:5000\`.

### Manual Setup

#### Backend

1. Navigate to the \`backend\` directory: \`cd backend\`
2. Install dependencies: \`npm install\`
3. Create a \`.env\` file in the \`backend\` directory and configure your environment variables (e.g., \`MONGO_URI\`, \`PORT\`, \`JWT_SECRET\`).
4. Start the server: \`npm start\` (or \`npm run dev\` for nodemon).

#### Frontend

1. Navigate to the \`frontend\` directory: \`cd frontend\`
2. Install dependencies: \`npm install\`
3. Start the application: \`npm start\`
