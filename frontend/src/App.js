import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Expense Sharing App</p>
        <nav>
          <Link to="/">Home</Link> | <Link to="/login">Login</Link> | <Link to="/register">Register</Link> | <Link to="/profile">Profile</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
