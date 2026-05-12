const express = require('express');
const router = express.Router();
const { getExpenses } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getExpenses);

module.exports = router;
