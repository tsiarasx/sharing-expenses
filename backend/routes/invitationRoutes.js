const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  sendInvitation,
  acceptInvitation,
  rejectInvitation
} = require('../controllers/invitationController');


router.post('/send', protect, sendInvitation);
router.put('/accept/:groupId', protect, acceptInvitation);
router.put('/reject/:groupId', protect, rejectInvitation);


module.exports = router;