const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google - Verify Google token and create/get user
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'No credential provided' });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ googleId });

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user with unique avatar color
      const avatarColor = await User.getNextAvatarColor();

      user = new User({
        googleId,
        email,
        name,
        picture,
        avatarColor,
      });

      await user.save();
      console.log(`New user created: ${email} with color ${avatarColor}`);
    }

    // Return user data (without sensitive fields)
    res.json({
      id: user._id,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      avatarColor: user.avatarColor,
      role: user.role,
      status: user.status,
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// PUT /api/auth/status - Update user status
router.put('/status', async (req, res) => {
  try {
    const { googleId, status } = req.body;

    if (!googleId || !status) {
      return res.status(400).json({ error: 'Missing googleId or status' });
    }

    const user = await User.findOneAndUpdate(
      { googleId },
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ status: user.status });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/auth/users - Get all users (for "On Duty" display)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, {
      googleId: 1,
      name: 1,
      email: 1,
      avatarColor: 1,
      role: 1,
      status: 1,
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

module.exports = router;
