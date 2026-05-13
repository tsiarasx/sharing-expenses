# Project Initialization Context (init.md)

## 1. Project Overview
This is the "Expense-Sharing App" for groups (friends, roommates, travelers) to track shared expenses, compute who owes whom, and minimize settlement transactions.

## 2. Tech Stack
- **Frontend:** React.js, Tailwind CSS, Axios, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT and bcrypt
- **Environment:** Local development with `npm` and a MongoDB instance (local or Atlas)

## 3. Architecture & Directory Structure (actual)
The repo uses a simple monorepo layout with separate `backend` and `frontend` folders.

```text
Expense-Sharing-App/
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── pages/
    │   ├── context/
    │   ├── services/
    │   ├── index.js
    │   └── App.js
    ├── tailwind.config.js
    └── package.json
```

