const express = require('express');
const router = express.Router();
// Προσοχή: Εδώ βάζουμε το middleware του Χρήστου (υποθέτω είναι στο backend/middleware/authMiddleware.js)
// Αν λέγεται αλλιώς ή είναι σε άλλο path, διόρθωσέ το!
const { protect } = require('../middleware/authMiddleware'); 

const {
  sendInvitation,
  acceptInvitation,
  rejectInvitation
} = require('../controllers/invitationController');

// Όλα τα routes προστατεύονται
router.post('/send', protect, sendInvitation);
router.put('/accept/:groupId', protect, acceptInvitation); // Το ID της ομάδας στο URL
router.put('/reject/:groupId', protect, rejectInvitation);


module.exports = router;