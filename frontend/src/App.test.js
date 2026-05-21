import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GroupProvider } from './context/GroupContext';
import App from './App';

test('renders app successfully and shows the title', () => {
  render(
    <AuthProvider>
      <BrowserRouter>
        <GroupProvider><App /></GroupProvider>
      </BrowserRouter>
    </AuthProvider>
  );
  // Matches "SplitWise" since we changed the app title text from "Expense Sharing App"
  const textElement = screen.getByText(/SplitWise/i);
  expect(textElement).toBeInTheDocument();
});
