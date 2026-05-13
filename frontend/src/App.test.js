import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GroupProvider } from './context/GroupContext';
import App from './App';

test('renders app successfully and shows the title', () => {
  render(
    <AuthProvider>
      <GroupProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GroupProvider>
    </AuthProvider>
  );
  // Matches "SplitWise" since we changed the app title text from "Expense Sharing App"
  // It now appears twice (in Dashboard and Navbar) so we use getAllByText
  const textElements = screen.getAllByText(/SplitWise/i);
  expect(textElements.length).toBeGreaterThan(0);
});
