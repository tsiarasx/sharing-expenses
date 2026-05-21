const Notification = require('../models/Notification');

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Fetch only unread or all (sorted by most recent)
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

module.exports = {
  getUserNotifications,
  markAsRead
};