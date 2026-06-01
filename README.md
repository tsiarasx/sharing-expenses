# Expense-Sharing App

[![CI/CD Pipeline](https://github.com/tsiarasx/sharing-expenses/actions/workflows/ci.yml/badge.svg)](https://github.com/tsiarasx/sharing-expenses/actions/workflows/ci.yml)
[![Release & Versioning](https://github.com/tsiarasx/sharing-expenses/actions/workflows/release.yml/badge.svg)](https://github.com/tsiarasx/sharing-expenses/actions/workflows/release.yml)
[![Deploy](https://github.com/tsiarasx/sharing-expenses/actions/workflows/deploy.yml/badge.svg)](https://github.com/tsiarasx/sharing-expenses/actions/workflows/deploy.yml)

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

The frontend reads `REACT_APP_API_URL` to determine the backend base URL (defaults to `http://localhost:5000`). To override it, add a `.env` file to `frontend/` with:

```env
REACT_APP_API_URL=http://your-backend-url
```

## DevOps & CI/CD

This project includes a complete DevOps infrastructure with GitHub Actions, Git Flow branching strategy, and semantic versioning.

### Quick Links
- **[DEVOPS.md](./DEVOPS.md)** - Complete DevOps implementation guide
- **[GIT_FLOW_SETUP.md](./GIT_FLOW_SETUP.md)** - Git Flow branching strategy and setup
- **[GITHUB_ACTIONS_GUIDE.md](./GITHUB_ACTIONS_GUIDE.md)** - GitHub Actions workflows reference
- **[.github/workflows/README.md](./.github/workflows/README.md)** - Workflow directory documentation

### Features
- ✅ Automated CI/CD pipeline (GitHub Actions)
- ✅ Git Flow branching strategy (main, develop, feature/*, release/*, hotfix/*)
- ✅ Semantic versioning with automatic version bumping
- ✅ Automated testing (backend & frontend)
- ✅ Security scanning (npm audit)
- ✅ Code quality checks
- ✅ Automated releases and GitHub Releases
- ✅ Build artifacts for deployment

### Development Workflow

#### Create a Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
# Make changes...
git add .
git commit -m "feat: description of feature"
git push origin feature/my-feature
# Create PR on GitHub
```

#### Release a Version
1. Go to **GitHub Actions** tab
2. Select **Release & Versioning**
3. Click **Run workflow**
4. Choose version bump: patch / minor / major
5. Done! Everything is automated

For more details, see [DEVOPS.md](./DEVOPS.md)

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

When contributing:
1. Create a feature branch from `develop`
2. Follow commit message conventions (see [GIT_FLOW_SETUP.md](./GIT_FLOW_SETUP.md))
3. Ensure all tests pass
4. Create a pull request to `develop`
5. Wait for CI checks and code review
