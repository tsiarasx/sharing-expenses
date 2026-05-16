import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserDashboard from './pages/UserDashboard';
import GroupDashboard from './pages/GroupDashboard';
import GroupDetails from './pages/GroupDetails';


function App() {
  return (
    <div className="App font-sans text-gray-900 bg-gray-50 min-h-screen">
      <Routes>
        <Route path="/dashboard" element={<UserDashboard />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/groups/:id" element={<GroupDashboard />} />
        <Route path="/groups/:id" element={<GroupDetails />} />
      </Routes>
    </div>
  );
}

export default App;
