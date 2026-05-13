const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroupById,
  addMemberToGroup
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

// Apply protect middleware to all routes
router.use(protect);

// Group routes
router.route('/')
  .get(getGroups)
  .post(createGroup);

router.route('/:id')
  .get(getGroupById);

router.route('/:id/members')
  .post(addMemberToGroup);

module.exports = router;
