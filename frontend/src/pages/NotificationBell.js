import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, acceptInvitation, rejectInvitation, markNotificationAsRead } from '../services/invitationService';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const toEnglishNotificationMessage = (message = '') => {
    if (message.startsWith('Σας προσκάλεσαν στην ομάδα:')) {
      return message.replace('Σας προσκάλεσαν στην ομάδα:', 'You have been invited to join group:');
    }
    if (message.startsWith('Προστέθηκε νέο έξοδο')) {
      return message
        .replace('Προστέθηκε νέο έξοδο', 'A new expense')
        .replace('ύψους', 'of')
        .replace('στην ομάδα', 'in group');
    }
    if (message.startsWith('Υπενθύμιση:')) {
      return message
        .replace('Υπενθύμιση:', 'Reminder:')
        .replace('σας υπενθυμίζει ότι εκκρεμούν οφειλές στην ομάδα', 'reminds you that you have pending debts in group');
    }
    return message;
  };

  // Φέρνει τις ειδοποιήσεις από το API
  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      
      // Υπολογισμός unread ειδοποιήσεων
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Polling: Ελέγχει για νέες ειδοποιήσεις κάθε 30 δευτερόλεπτα (Push προσομοίωση)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBellClick = async () => {
    const nextShowDropdown = !showDropdown;
    setShowDropdown(nextShowDropdown);

    // Αν το μενού ΑΝΟΙΓΕΙ, κάνουμε read τα έξοδα και τα reminders
    if (nextShowDropdown) {
      // Φιλτράρουμε ειδοποιήσεις που ΔΕΝ είναι προσκλήσεις (γιατί οι προσκλήσεις θέλουν Accept/Decline) 
      // και είναι unread
      const nonInviteUnread = notifications.filter(
        (n) => !n.isRead && n.type !== 'invitation'
      );

      if (nonInviteUnread.length > 0) {
        try {
          // Στέλνουμε αίτημα στο backend για κάθε μία παράλληλα
          const readPromises = nonInviteUnread.map((n) => markNotificationAsRead(n._id));
          await Promise.all(readPromises);
          
          // Ανανεώνουμε τοπικά τη λίστα χωρίς να ξανακάνουμε fetch
          fetchNotifications();
        } catch (error) {
          console.error("Error marking notifications as read:", error);
        }
      }
    }
  };

  const handleAccept = async (groupId) => {
    try {
      await acceptInvitation(groupId);
      alert('Successfully joined group.');
      fetchNotifications();
      setShowDropdown(false);
      navigate(`/groups/${groupId}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Error while accepting invitation.');
    }
  };

  const handleReject = async (groupId) => {
    try {
      await rejectInvitation(groupId);
      alert('Invitation rejected.');
      fetchNotifications();
    } catch (error) {
      alert(error.response?.data?.message || 'Error while rejecting invitation.');
    }
  };

  // Επιστρέφει το κατάλληλο στυλ ανάλογα με τον τύπο της ειδοποίησης
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'invitation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expense_added':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reminder':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="relative">
      {/* Κουμπί Καμπάνας */}
      <button 
        onClick={handleBellClick}
        className="text-gray-500 hover:text-gray-700 relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        
        {/* Αριθμός unread ειδοποιήσεων */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Μενού */}
      {showDropdown && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 font-semibold text-sm text-gray-700 border-b border-gray-100 flex justify-between items-center">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs text-blue-600 font-normal">{unreadCount} new</span>
            )}
          </div>
          
          <div className="divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500 text-center">
                No notifications.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors ${notif.isRead ? 'opacity-60' : 'bg-blue-50/10'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 border rounded ${getBadgeStyle(notif.type)}`}>
                      {notif.type === 'expense_added' ? 'NEW EXPENSE' : notif.type === 'invitation' ? 'INVITATION' : 'REMINDER'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(notif.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-800 font-medium mb-2">{toEnglishNotificationMessage(notif.message)}</p>
                  
                  {/* Κουμπιά Accept/Decline ΜΟΝΟ για εκκρεμείς προσκλήσεις */}
                  {notif.type === 'invitation' && !notif.isRead && (
                    <div className="flex gap-2 mt-1">
                      <button 
                        onClick={() => handleAccept(notif.relatedGroup?._id)}
                        className="px-3 py-1 bg-blue-700 text-white text-[11px] font-semibold rounded hover:bg-blue-800 transition-colors"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleReject(notif.relatedGroup?._id)}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-[11px] font-semibold rounded hover:bg-gray-200 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;