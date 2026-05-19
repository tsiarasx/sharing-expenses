import React, { useState } from 'react';

function ExpensesManager() {
  const [participants] = useState([
    { id: '1', name: 'Γιώργος' },
    { id: '2', name: 'Μαρία' },
    { id: '3', name: 'Κώστας' }
  ]);

  const [expenses, setExpenses] = useState([
    { id: '101', description: 'Σούπερ Μάρκετ', amount: 60, payer: 'Γιώργος', type: 'expense' }
  ]);

  const [settlePayer, setSettlePayer] = useState('');
  const [settleReceiver, setSettleReceiver] = useState('');
  const [settleAmount, setSettleAmount] = useState('');

  const calculateBalances = () => {
    let balances = {};
    participants.forEach(p => balances[p.name] = 0);

    expenses.forEach(expense => {
      const amount = parseFloat(expense.amount);
      const payer = expense.payer;

      if (expense.type === 'settlement') {
        if (balances[payer] !== undefined) balances[payer] += amount;
        if (balances[expense.receiver] !== undefined) balances[expense.receiver] -= amount;
      } else {
        const share = amount / participants.length;
        if (balances[payer] !== undefined) balances[payer] += amount;

        participants.forEach(p => {
          if (balances[p.name] !== undefined) {
            balances[p.name] -= share;
          }
        });
      }
    });
    return balances;
  };

  const balances = calculateBalances();

  const handleSettlementSubmit = (e) => {
    e.preventDefault();
    if (!settlePayer || !settleReceiver || !settleAmount) return;
    if (settlePayer === settleReceiver) {
      alert("Ο χρήστης δεν μπορεί να δώσει χρήματα στον εαυτό του!");
      return;
    }

    const newSettlement = {
      id: Date.now().toString(),
      description: `Εξόφληση: ${settlePayer} ➔ ${settleReceiver}`,
      amount: parseFloat(settleAmount),
      payer: settlePayer,
      receiver: settleReceiver,
      type: 'settlement'
    };

    setExpenses([...expenses, newSettlement]);
    setSettlePayer('');
    setSettleReceiver('');
    setSettleAmount('');
  };

  return (
    <div style={{ color: 'white', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <hr style={{ borderColor: '#444' }} />
      
      <div>
        <h3>Υπόλοιπα Χρηστών</h3>
        <ul>
          {Object.keys(balances).map(user => {
            const amount = balances[user];
            return (
              <li key={user} style={{ margin: '10px 0' }}>
                <strong>{user}:</strong> {' '}
                {amount > 0 ? (
                  <span style={{ color: '#4caf50' }}>Σου οφείλονται +{amount.toFixed(2)}€</span>
                ) : amount < 0 ? (
                  <span style={{ color: '#f44336' }}>Χρωστάς {Math.abs(amount).toFixed(2)}€</span>
                ) : (
                  <span style={{ color: '#aaa' }}>0.00€</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <hr style={{ borderColor: '#444' }} />

      <div>
        <h3>Καταγραφή Εξόφλησης</h3>
        <form onSubmit={handleSettlementSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Ποιος πληρώνει;</label>
            <select 
              value={settlePayer} 
              onChange={(e) => setSettlePayer(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px', color: '#333', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">-- Επιλέξτε άτομο --</option>
              {participants.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Σε ποιον τα δίνει;</label>
            <select 
              value={settleReceiver} 
              onChange={(e) => setSettleReceiver(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px', color: '#333', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">-- Επιλέξτε άτομο --</option>
              {participants.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Ποσό (€)</label>
            <input 
              type="number" 
              value={settleAmount} 
              onChange={(e) => setSettleAmount(e.target.value)} 
              placeholder="0.00"
              step="0.01"
              style={{ width: '100%', padding: '8px', marginTop: '5px', color: '#333', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          
          <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>
            Καταγραφή Πληρωμής
          </button>
        </form>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Ιστορικό Εγγραφών</h3>
        <ul style={{ paddingLeft: '20px' }}>
          {expenses.map(exp => (
            <li key={exp.id} style={{ margin: '5px 0', color: '#ddd' }}>
              {exp.description} - <strong>{exp.amount}€</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ExpensesManager;