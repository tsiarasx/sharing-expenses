const express = require('express');
const router = express.Router();

const {
  createExpense,
  getGroupExpenses,
  deleteExpense,
  updateExpense,
} = require('../controllers/expenseController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createExpense);
router.get('/:groupId', getGroupExpenses);
router.delete('/:id', deleteExpense);
router.put('/:id', updateExpense);
module.exports = router;    