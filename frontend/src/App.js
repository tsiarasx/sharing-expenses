import React from 'react';
import './App.css';
import ExpensesManager from './pages/SettleUp';

function App() {
  return (
    <div style={{ background: '#1e222b', minHeight: '100vh', color: 'white', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Expense Sharing Application</h1>
      {/* Εδώ εμφανίζεται το κομμάτι σου, χωρίς να ρωτήσει κανέναν Router */}
      <ExpensesManager />
    </div>
  );
}

export default App;