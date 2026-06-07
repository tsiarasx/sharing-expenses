import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GroupDetails from '../pages/GroupDetails';
import expenseService from '../services/expenseService';

// Mock services
jest.mock('../services/expenseService');
jest.mock('../services/debtService', () => ({
  getDebts: jest.fn().mockResolvedValue({ transactions: [] }),
  recordSettlement: jest.fn(),
}));
jest.mock('../services/invitationService', () => ({
  sendInvitation: jest.fn(),
  sendBulkDebtReminders: jest.fn(),
  getNotifications: jest.fn().mockResolvedValue([]),
  markNotificationAsRead: jest.fn(),
}));

// Mock useParams and useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'group1' }),
  useNavigate: () => jest.fn(),
}));

const mockUser = { _id: 'user1', name: 'John Doe', token: 'fake-token' };

const mockGroupDashboard = {
  success: true,
  data: {
    groupDetails: {
      _id: 'group1',
      name: 'Test Group',
      createdBy: { _id: 'user1', name: 'John Doe', email: 'john@example.com' },
      members: [
        { _id: 'user1', name: 'John Doe', email: 'john@example.com', status: 'accepted' },
        { _id: 'user2', name: 'Jane Doe', email: 'jane@example.com', status: 'accepted' },
      ],
    },
    totalGroupExpenses: 0,
    debts: [],
  },
};

const mockGroupBasic = {
  _id: 'group1',
  name: 'Test Group',
  members: [
    { user: { _id: 'user1', name: 'John Doe' }, status: 'accepted' },
    { user: { _id: 'user2', name: 'Jane Doe' }, status: 'accepted' },
  ],
};

describe('ExpenseForm (inside GroupDetails)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock global fetch for GroupDetails initialization
    global.fetch = jest.fn((url) => {
      if (url.includes('/dashboard')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGroupDashboard),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroupBasic),
      });
    });

    expenseService.getGroupExpenses.mockResolvedValue([]);
    expenseService.createExpense.mockResolvedValue({ success: true });
  });

  const renderComponent = () =>
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <BrowserRouter>
          <GroupDetails />
        </BrowserRouter>
      </AuthContext.Provider>
    );

  test('submits an equal split expense successfully', async () => {
    renderComponent();

    // Wait for group to load
    await screen.findAllByText('Test Group');

    // Click Add Expense
    const addBtn = screen.getByText('Add Expense');
    fireEvent.click(addBtn);

    // Fill form using placeholders
    fireEvent.change(screen.getByPlaceholderText('Dinner, Trip, Hotel...'), { target: { value: 'Lunch' } });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '20' } });
    
    // Fill Date (the only empty input left after description/amount)
    // We use getByDisplayValue to avoid direct node access
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: '2026-06-06' } });

    // Verify Equal Split preview text appears
    expect(screen.getByText(/Each member owes: €10.00/i)).toBeInTheDocument();

    // Submit
    const saveBtn = screen.getByText('Save Expense');
    fireEvent.click(saveBtn);

    await waitFor(() => expect(expenseService.createExpense).toHaveBeenCalled());
    expect(expenseService.createExpense).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Lunch',
      totalAmount: 20,
      splitMethod: 'Equal Split',
    }));
  });

  test('validates mathematical correctness for Exact Amounts', async () => {
    window.alert = jest.fn(); // Mock alert to catch validation messages
    renderComponent();
    await screen.findAllByText('Test Group');

    fireEvent.click(screen.getByText('Add Expense'));
    fireEvent.change(screen.getByPlaceholderText('Dinner, Trip, Hotel...'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '100' } });
    
    // Fill Date
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: '2026-06-06' } });
    
    // Change Split Method using its display value
    fireEvent.change(screen.getByDisplayValue('Equal Split'), { target: { value: 'Exact Amounts' } });

    // Find the member-specific amount inputs
    const inputs = screen.getAllByPlaceholderText('0.00');
    // inputs[0] is total amount, inputs[1] is John, inputs[2] is Jane
    fireEvent.change(inputs[1], { target: { value: '50' } });
    fireEvent.change(inputs[2], { target: { value: '40' } }); // Total 90, which is != 100

    fireEvent.click(screen.getByText('Save Expense'));

    expect(window.alert).toHaveBeenCalledWith('Exact amounts must equal the total expense.');
    expect(expenseService.createExpense).not.toHaveBeenCalled();
  });

  test('calculates correct splits for Percentages', async () => {
    renderComponent();
    await screen.findAllByText('Test Group');

    fireEvent.click(screen.getByText('Add Expense'));
    fireEvent.change(screen.getByPlaceholderText('Dinner, Trip, Hotel...'), { target: { value: 'Pizza' } });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '50' } });
    
    // Fill Date
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: '2026-06-06' } });

    // Change Split Method
    fireEvent.change(screen.getByDisplayValue('Equal Split'), { target: { value: 'Percentages' } });

    // Find percentage inputs
    const percInputs = screen.getAllByPlaceholderText('0');
    fireEvent.change(percInputs[0], { target: { value: '40' } }); // John 40%
    fireEvent.change(percInputs[1], { target: { value: '60' } }); // Jane 60%

    fireEvent.click(screen.getByText('Save Expense'));

    await waitFor(() => expect(expenseService.createExpense).toHaveBeenCalled());
    expect(expenseService.createExpense).toHaveBeenCalledWith(expect.objectContaining({
      splitMethod: 'Percentages',
      splits: expect.arrayContaining([
        expect.objectContaining({ user: 'user1', amountOwed: 20 }),
        expect.objectContaining({ user: 'user2', amountOwed: 30 }),
      ]),
    }));
  });
});
