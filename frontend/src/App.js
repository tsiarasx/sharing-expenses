import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Expense Sharing App</p>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          {/* Add more routes here as needed */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
