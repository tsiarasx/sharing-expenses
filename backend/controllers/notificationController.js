const Notification = require('../models/Notification');
const Group = require('../models/Group');

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Φέρνουμε μόνο τα μη διαβασμένα ή όλα (ταξινομημένα από το πιο πρόσφατο)
    const notifications = await Notification.find({ user: userId })
      .populate('relatedGroup', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error("MARK AS READ ERROR:", error);
    res.status(500).json({ message: 'Server error updating notification' });
  }
};

const sendBulkReminders = async (req, res) => {
  try {
    const { debtorIds, groupId } = req.body;
    const creditorName = req.user.name; // Αυτός που πατάει το κουμπί

    if (!debtorIds || !Array.isArray(debtorIds) || debtorIds.length === 0) {
      return res.status(400).json({ message: 'Δεν βρέθηκαν οφειλέτες.' });
    }

    const groupData = await Group.findById(groupId);
    const groupName = groupData ? groupData.name : 'Ομάδα'; 

    // Δημιουργούμε ένα promise για κάθε οφειλέτη
    const reminderPromises = debtorIds.map((debtorId) => {
      return Notification.create({
        user: debtorId,
        message: `Υπενθύμιση: Ο/Η ${creditorName} σας υπενθυμίζει ότι εκκρεμούν οφειλές στην ομάδα ${groupName}.`,
        type: 'reminder',
        relatedGroup: groupId
      });
    });

    // Εκτέλεση όλων μαζί παράλληλα στη βάση
    await Promise.all(reminderPromises);

    res.status(201).json({ message: 'Όλες οι υπενθυμίσεις στάλθηκαν επιτυχώς!' });
  } catch (error) {
    console.error("BULK REMINDER ERROR:", error);
    res.status(500).json({ message: 'Σφάλμα διακομιστή κατά τη μαζική υπενθύμιση.' });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  sendBulkReminders
};