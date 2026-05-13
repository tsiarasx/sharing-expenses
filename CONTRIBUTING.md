# Contributing Guide

Welcome to the team! This guide will help you understand our project structure and how to add new features or endpoints.

## Folder Structure

The project is split into two main parts: `backend` and `frontend`.

### Backend
- `/controllers`: Contains functions handling the logic for API endpoints.
- `/models`: Defines MongoDB schemas using Mongoose.
- `/routes`: Sets up the API routes and links them to the controllers.
- `/middleware`: Contains custom middleware functions like authentication.

### Frontend
- `/src/components`: Reusable UI components (e.g., `Button`, `InputField`, `Navbar`).
- `/src/pages`: Main view components representing different routes (e.g., `Dashboard`, `Login`).
- `/src/services`: Handles API requests to the backend.
- `/src/context`: React Context API files for global state management.

## Using Reusable UI Components

We have created some standard Tailwind UI components to keep styling consistent across the app.

### Button Component

Use the `Button` component from `src/components/Button.js`.

```jsx
import Button from '../components/Button';

function MyPage() {
  return (
    <Button variant="primary" onClick={() => alert('Clicked!')}>
      Click Me
    </Button>
  );
}
```
Available variants: `primary`, `secondary`, `danger`, `outline`.

### InputField Component

Use the `InputField` component from `src/components/InputField.js` for forms.

```jsx
import InputField from '../components/InputField';

function MyForm() {
  return (
    <InputField
      label="Username"
      id="username"
      name="username"
      value={userName}
      onChange={handleChange}
      placeholder="Enter your username"
      required
    />
  );
}
```

## Standard Practices

### Adding a New Endpoint (Backend)
1. Add a new route in `backend/routes/`.
2. Add the corresponding controller logic in `backend/controllers/`.
3. If necessary, create or update a model in `backend/models/`.

### Adding a New Page (Frontend)
1. Create a new component in `frontend/src/pages/`.
2. Import the page and add a new `<Route>` in `frontend/src/App.js`.
3. Add a link to the new page in `frontend/src/components/Navbar.js` if it should be globally accessible.
4. Add any necessary API call methods in `frontend/src/services/`.

Please restrict implementation scope strictly to your assigned Jira ticket!
