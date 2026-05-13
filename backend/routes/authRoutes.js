const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateUserProfile,
  deleteUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile').put(protect, updateUserProfile).delete(protect, deleteUserProfile);

module.exports = router;
