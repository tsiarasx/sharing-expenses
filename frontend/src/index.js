import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { GroupProvider } from './context/GroupContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <GroupProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GroupProvider>
    </AuthProvider>
  </React.StrictMode>
);

