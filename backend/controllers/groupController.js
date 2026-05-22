const mongoose = require('mongoose');
const Group = require('../models/Group');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Notification = require('../models/Notification');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const group = await Group.create({
      name: name.trim(),
      members: [
        {
          user: req.user._id,
          status: 'accepted'
        }
      ]
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('members.user', 'name email');

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all groups for the logged-in user
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: {
        $elemMatch: {
          user: req.user._id,
          status: 'accepted'
        }
      }
    });

    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid group ID' });
  }

  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the user is a member of this group
    const isMember = group.members.some(
      member => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to access this group' });
    }

    res.json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private
const addMemberToGroup = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid group ID' });
  }

  try {
    const { email } = req.body;

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if requesting user is a member
    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: 'Not authorized to add members to this group'
      });
    }

    // Find the user by email
    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    const alreadyMember = group.members.some(
      member => member.user.toString() === userToAdd._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: 'User is already a member of this group'
      });
    }

    // Add the user to the group
    group.members.push({
      user: userToAdd._id,
      status: 'accepted'
    });

    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('members.user', 'name email');

    res.json(populatedGroup);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid group ID' });
  }

  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: 'Not authorized to delete this group'
      });
    }

    // Delete related data
    await Expense.deleteMany({ group: group._id });
    await Settlement.deleteMany({ group: group._id });
    await Notification.deleteMany({ relatedGroup: group._id });

    // Delete group
    await group.deleteOne();

    res.json({ message: 'Group deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  addMemberToGroup,
  deleteGroup
};