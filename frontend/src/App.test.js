import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';

test('renders expense sharing app text', () => {
  render(
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  );
  const textElement = screen.getByText(/Expense Sharing App/i);
  expect(textElement).toBeInTheDocument();
});
