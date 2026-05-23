const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserNotifications, markAsRead, sendBulkReminders } = require('../controllers/notificationController');

router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markAsRead);
router.post('/remind-all', protect, sendBulkReminders);

module.exports = router;