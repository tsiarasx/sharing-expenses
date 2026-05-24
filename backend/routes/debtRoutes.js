const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { calculateDebts, recordSettlement, getGroupSettlements } = require('../controllers/debtController');

router.use(protect);

// GET  /api/debts/:groupId           → υπολογισμός χρεών
// POST /api/debts/:groupId/settle    → καταγραφή εξόφλησης
// GET  /api/debts/:groupId/history   → ιστορικό settlements
router.get('/:groupId', calculateDebts);
router.post('/:groupId/settle', recordSettlement);
router.get('/:groupId/history', getGroupSettlements);

module.exports = router;
