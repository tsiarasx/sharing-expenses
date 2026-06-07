import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GroupDetails from '../pages/GroupDetails';
import * as invitationService from '../services/invitationService';

// Mock services
jest.mock('../services/expenseService', () => ({
  getGroupExpenses: jest.fn().mockResolvedValue([]),
  createExpense: jest.fn(),
}));
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
  ],
};

describe('InviteMemberModal (inside GroupDetails)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
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
  });

  const renderComponent = () =>
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <BrowserRouter>
          <GroupDetails />
        </BrowserRouter>
      </AuthContext.Provider>
    );

  test('opens the modal and sends a successful invitation', async () => {
    invitationService.sendInvitation.mockResolvedValue({ message: 'Invitation sent successfully' });

    renderComponent();
    await screen.findAllByText('Test Group');

    // Open Modal
    fireEvent.click(screen.getByText('Invite Member'));

    // Check modal content
    expect(screen.getByText('Invite Member to Group')).toBeInTheDocument();

    // Fill email
    const emailInput = screen.getByPlaceholderText('friend@example.com');
    fireEvent.change(emailInput, { target: { value: 'friend@test.com' } });

    // Submit
    fireEvent.click(screen.getByText('Send Invite'));

    await screen.findByText('Invitation sent successfully');
    expect(invitationService.sendInvitation).toHaveBeenCalledWith('group1', 'friend@test.com');
  });

  test('displays error message when invitation fails', async () => {
    invitationService.sendInvitation.mockRejectedValue({
      response: { data: { message: 'User not found' } }
    });

    renderComponent();
    await screen.findAllByText('Test Group');

    fireEvent.click(screen.getByText('Invite Member'));
    fireEvent.change(screen.getByPlaceholderText('friend@example.com'), { target: { value: 'unknown@test.com' } });
    fireEvent.click(screen.getByText('Send Invite'));

    await screen.findByText('User not found');
  });

  test('can cancel and close the modal', async () => {
    renderComponent();
    await screen.findAllByText('Test Group');

    fireEvent.click(screen.getByText('Invite Member'));
    expect(screen.getByText('Invite Member to Group')).toBeInTheDocument();

    // Click Cancel
    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Invite Member to Group')).not.toBeInTheDocument();
    });
  });
});
