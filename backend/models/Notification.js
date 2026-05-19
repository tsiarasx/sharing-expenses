const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true // Ο χρήστης που λαμβάνει την ειδοποίηση
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['invitation', 'expense_added', 'reminder'], 
    default: 'invitation' 
  },
  relatedGroup: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group' // Για να ξέρουμε σε ποιο group τον καλούν
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);