import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Βοηθητική συνάρτηση για να παίρνουμε το token από το localStorage
const getConfig = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
        headers: {
            Authorization: `Bearer ${user?.token}`,
        },
    };
};

// 1. Αποστολή πρόσκλησης (ESA-14)
export const sendInvitation = async (groupId, receiverEmail) => {
    const response = await axios.post(
        `${API_URL}/api/invitations/send`, // <-- Προστέθηκε το /api
        { groupId, receiverEmail },
        getConfig()
    );
    return response.data;
};

// 2. Αποδοχή πρόσκλησης (ESA-14)
export const acceptInvitation = async (groupId) => {
    const response = await axios.put(
        `${API_URL}/api/invitations/accept/${groupId}`, // <-- Ταίριασμα με το backend route μας
        {},
        getConfig()
    );
    return response.data;
};

// 3. Απόρριψη πρόσκλησης (ESA-14)
export const rejectInvitation = async (groupId) => {
    const response = await axios.put(
        `${API_URL}/api/invitations/reject/${groupId}`, // <-- Ταίριασμα με το backend route μας
        {},
        getConfig()
    );
    return response.data;
};

// 4. Λήψη ειδοποιήσεων (ESA-21)
export const getNotifications = async () => {
    const response = await axios.get(
        `${API_URL}/api/notifications`, // <-- Στο backend το βάλαμε στο /api/notifications
        getConfig()
    );
    return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
    const response = await axios.put(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        getConfig()
    );
    return response.data;
};

export const sendBulkDebtReminders = async (debtorIds, groupId) => {
    const response = await axios.post(
        `${API_URL}/api/notifications/remind-all`,
        { debtorIds, groupId },
        getConfig()
    );
    return response.data;
}