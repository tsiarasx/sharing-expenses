import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

function Home() {
  return (
    <div className="App-header">
      <p>Expense Sharing App</p>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
