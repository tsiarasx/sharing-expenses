import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationBell from '../pages/NotificationBell';
import * as invitationService from '../services/invitationService';

// Mock the invitationService
jest.mock('../services/invitationService');

// Mock useNavigate from react-router-dom
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

const mockNotifications = [
  {
    _id: '1',
    type: 'invitation',
    message: 'Σας προσκάλεσαν στην ομάδα: Roommates',
    isRead: false,
    relatedGroup: { _id: 'group1' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    type: 'expense_added',
    message: 'Προστέθηκε νέο έξοδο Pizza ύψους 20 στην ομάδα Roommates',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];

describe('NotificationBell Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    invitationService.getNotifications.mockResolvedValue(mockNotifications);
  });

  test('renders the bell icon and unread count badge', async () => {
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    // Find the unread count badge (2 unread notifications) - this also waits for the fetch
    const badge = await screen.findByText('2');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-500');
    expect(invitationService.getNotifications).toHaveBeenCalled();
  });

  test('opens the dropdown and displays notifications with translated messages', async () => {
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    await screen.findByText('2');

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    // Check if dropdown is visible
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    // Check translated messages
    expect(screen.getByText(/You have been invited to join group: Roommates/i)).toBeInTheDocument();
    expect(screen.getByText(/A new expense Pizza of 20 in group Roommates/i)).toBeInTheDocument();
  });

  test('marks non-invitation notifications as read when opening the dropdown', async () => {
    invitationService.markNotificationAsRead.mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    await screen.findByText('2');

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    // Should only call markNotificationAsRead for 'expense_added' (id: '2'), 
    // because 'invitation' (id: '1') requires manual action.
    expect(invitationService.markNotificationAsRead).toHaveBeenCalledWith('2');
    expect(invitationService.markNotificationAsRead).not.toHaveBeenCalledWith('1');
  });

  test('handles accepting an invitation', async () => {
    window.alert = jest.fn(); // Mock alert
    invitationService.acceptInvitation.mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    await screen.findByText('2');

    // Open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Find and click Accept button
    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);

    await waitFor(() => expect(invitationService.acceptInvitation).toHaveBeenCalledWith('group1'));
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/groups/group1');
    expect(window.alert).toHaveBeenCalledWith('Successfully joined group.');
  });

  test('handles rejecting an invitation', async () => {
    window.alert = jest.fn();
    invitationService.rejectInvitation.mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    await screen.findByText('2');

    fireEvent.click(screen.getByRole('button'));

    const declineButton = screen.getByText('Decline');
    fireEvent.click(declineButton);

    await waitFor(() => expect(invitationService.rejectInvitation).toHaveBeenCalledWith('group1'));
    expect(window.alert).toHaveBeenCalledWith('Invitation rejected.');
  });

  test('displays "No notifications" when the list is empty', async () => {
    invitationService.getNotifications.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    const bellButton = await screen.findByRole('button');
    fireEvent.click(bellButton);

    expect(screen.getByText('No notifications.')).toBeInTheDocument();
  });

  test('polls for new notifications every 30 seconds', async () => {
    jest.useFakeTimers();
    
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    await waitFor(() => expect(invitationService.getNotifications).toHaveBeenCalledTimes(1));

    // Fast-forward 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(invitationService.getNotifications).toHaveBeenCalledTimes(2);
    
    jest.useRealTimers();
  });
});
