import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Overview from './pages/Overview';

function App() {
  return (
    <div className="App font-sans text-gray-900 bg-gray-50 min-h-screen">
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/groups" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
