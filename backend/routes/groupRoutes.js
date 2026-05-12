const express = require('express');
const router = express.Router();
const { getGroups } = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getGroups);

module.exports = router;
