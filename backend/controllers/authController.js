const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Notification = require('../models/Notification');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const nextName = typeof req.body.name === 'string' ? req.body.name.trim() : user.name;
    const nextEmail = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : user.email;
    const nextPassword = typeof req.body.password === 'string' ? req.body.password.trim() : '';

    if (!nextName) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!nextEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(nextEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (nextEmail !== user.email) {
      const emailOwner = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (emailOwner) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    if (nextPassword && nextPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    user.name = nextName;
    user.email = nextEmail;
    if (nextPassword) {
      user.password = nextPassword;
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error('[updateUserProfile] Error:', error);
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Email is already in use' });
    }
    if (error?.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({
      message: 'Server error while updating profile',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/auth/profile
// @access  Private
const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const userId = user._id;

      // Remove this user from every group's membership list.
      await Group.updateMany(
        { 'members.user': userId },
        { $pull: { members: { user: userId } } }
      );

      // Mark expenses involving this user as failed instead of deleting shared history.
      await Expense.updateMany({
        status: { $in: ['active'] },
        $or: [{ payer: userId }, { 'splits.user': userId }],
      }, {
        $set: {
          status: 'failed',
          failedReason: 'A participant in this expense deleted their account',
          failedAt: new Date(),
        },
      });

      // Remove settlements where this user was payer/payee to prevent orphan debt adjustments.
      await Settlement.deleteMany({
        $or: [{ payer: userId }, { payee: userId }],
      });

      // Remove user-targeted notifications.
      await Notification.deleteMany({ user: userId });

      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  deleteUserProfile,
};
