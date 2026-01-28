const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLogger');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google - Verify Google token and authenticate user
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

    // Check if user exists by googleId (returning user) or email (invited user)
    let user = await User.findOne({ googleId });

    if (user) {
      // Returning user - update last login and lastSeen
      user.lastLogin = new Date();
      user.lastSeen = new Date();
      user.status = 'AVAILABLE';

      // Migrate legacy roles to valid ones
      const validRoles = ['ADMIN', 'OPERATIONS', 'SALES', 'ACCOUNTING', 'CLIENT'];
      if (!validRoles.includes(user.role)) {
        console.log(`Migrating legacy role '${user.role}' to 'ADMIN' for ${email}`);
        user.role = 'ADMIN';
      }

      await user.save();
    } else {
      // Check if user was invited by email
      user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        // First login for invited user - update with Google info
        const avatarColor = user.avatarColor || await User.getNextAvatarColor();
        user.googleId = googleId;
        user.name = name;
        user.picture = picture;
        user.avatarColor = avatarColor;
        user.lastLogin = new Date();
        user.lastSeen = new Date();
        user.status = 'AVAILABLE';

        // Migrate legacy roles to valid ones
        const validRoles = ['ADMIN', 'OPERATIONS', 'SALES', 'ACCOUNTING', 'CLIENT'];
        if (!validRoles.includes(user.role)) {
          console.log(`Migrating legacy role '${user.role}' to 'ADMIN' for ${email}`);
          user.role = 'ADMIN';
        }

        await user.save();
        console.log(`Invited user first login: ${email}`);
      } else {
        // User not invited - create as CLIENT with limited access (Client Portal only)
        const avatarColor = await User.getNextAvatarColor();
        user = new User({
          googleId,
          email: email.toLowerCase(),
          name,
          picture,
          avatarColor,
          role: 'CLIENT',
          status: 'AVAILABLE',
          isActive: true,
          lastLogin: new Date(),
          lastSeen: new Date(),
        });
        await user.save();
        console.log(`New client user auto-created: ${email}`);
      }
    }

    // Check if user is active
    if (!user.isActive) {
      await logAudit({
        user,
        action: 'FAILED_LOGIN',
        resourceType: 'User',
        resourceId: user._id,
        details: { reason: 'Account deactivated' },
        req,
        success: false,
        errorMessage: 'Account disabled'
      });
      return res.status(403).json({
        error: 'Account disabled',
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    // Log successful login
    await logAudit({
      user,
      action: 'LOGIN',
      resourceType: 'User',
      resourceId: user._id,
      resourceName: user.email,
      req
    });

    // Return user data
    res.json({
      id: user._id,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      avatarColor: user.avatarColor,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
    });

  } catch (error) {
    console.error('Auth error:', error);
    await logAudit({
      action: 'FAILED_LOGIN',
      details: { error: error.message },
      req,
      success: false,
      errorMessage: 'Invalid token'
    });
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
      { status, lastSeen: new Date() },
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

// PUT /api/auth/heartbeat - Update lastSeen timestamp (called periodically by frontend)
router.put('/heartbeat', async (req, res) => {
  try {
    const { googleId } = req.body;

    if (!googleId) {
      return res.status(400).json({ error: 'Missing googleId' });
    }

    await User.findOneAndUpdate(
      { googleId },
      { lastSeen: new Date() }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ error: 'Failed to update heartbeat' });
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
      lastSeen: 1,
    });

    // Check for stale users - if lastSeen > 10 minutes ago, treat as OFFLINE
    // (heartbeat is sent every 2 minutes, so 10 minutes allows for some network delays)
    const STALE_THRESHOLD = 10 * 60 * 1000; // 10 minutes
    const now = Date.now();

    const usersWithStatus = users.map(user => {
      const userObj = user.toObject();
      // If user has a lastSeen and it's stale, override status to OFFLINE
      if (userObj.lastSeen && userObj.status !== 'OFFLINE') {
        const lastSeenTime = new Date(userObj.lastSeen).getTime();
        if (now - lastSeenTime > STALE_THRESHOLD) {
          userObj.status = 'OFFLINE';
        }
      }
      // Remove lastSeen from response (internal use only)
      delete userObj.lastSeen;
      return userObj;
    });

    res.json(usersWithStatus);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

module.exports = router;
