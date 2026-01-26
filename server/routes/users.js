const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET /api/users - Get all users (for admin user management)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
      .select('email name role status isActive avatarColor invitedAt lastLogin createdAt')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// POST /api/users/invite - Invite a new user
router.post('/invite', async (req, res) => {
  try {
    const { email, name, role, invitedById } = req.body;

    if (!email || !name || !role) {
      return res.status(400).json({ error: 'Email, name, and role are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    // Validate role
    const validRoles = ['ADMIN', 'OPERATIONS', 'SALES', 'ACCOUNTING', 'CLIENT'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Create invited user
    const user = new User({
      email: email.toLowerCase(),
      name,
      role,
      isActive: true,
      invitedBy: invitedById || null,
      invitedAt: new Date(),
      status: 'OFFLINE',
    });

    await user.save();
    console.log(`User invited: ${email} as ${role}`);

    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      invitedAt: user.invitedAt,
    });

  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Failed to invite user' });
  }
});

// PUT /api/users/:id - Update user role or status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive, name } = req.body;

    const updateFields = {};
    if (role !== undefined) {
      const validRoles = ['ADMIN', 'OPERATIONS', 'SALES', 'ACCOUNTING', 'CLIENT'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      updateFields.role = role;
    }
    if (isActive !== undefined) {
      updateFields.isActive = isActive;
    }
    if (name !== undefined) {
      updateFields.name = name;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    ).select('email name role status isActive avatarColor lastLogin');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`User updated: ${user.email} - ${JSON.stringify(updateFields)}`);

    res.json(user);

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`User deleted: ${user.email}`);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
