const express = require('express');
const { Resend } = require('resend');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLogger');

const router = express.Router();

// Initialize Resend (will be null if no API key)
const resendApiKey = process.env.RESEND_API_KEY;
console.log(`[RESEND INIT] API Key present: ${!!resendApiKey}, Key starts with: ${resendApiKey ? resendApiKey.substring(0, 10) + '...' : 'N/A'}`);
const resend = resendApiKey ? new Resend(resendApiKey) : null;
console.log(`[RESEND INIT] Resend client initialized: ${!!resend}`);

// App URL for invite links
const APP_URL = process.env.APP_URL || 'https://paragon-hub.netlify.app';

// Role display names
const getRoleDisplayName = (role) => {
  switch (role) {
    case 'ADMIN': return 'Administrator';
    case 'OPERATIONS': return 'Operations';
    case 'SALES': return 'Concierge';
    case 'ACCOUNTING': return 'Accounting';
    default: return role;
  }
};

// Send invite email
const sendInviteEmail = async (toEmail, toName, role) => {
  console.log(`[SEND EMAIL] Attempting to send invite to: ${toEmail}, name: ${toName}, role: ${role}`);
  console.log(`[SEND EMAIL] Resend client available: ${!!resend}`);

  if (!resend) {
    console.log('[SEND EMAIL] Resend not configured - skipping email');
    return { success: false, reason: 'Email not configured' };
  }

  try {
    const roleDisplay = getRoleDisplayName(role);

    const { data, error } = await resend.emails.send({
      from: 'Paragon Hub <invites@paragonconcierge.com>',
      to: [toEmail],
      subject: "You've been invited to Paragon Hub",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #1e293b; padding: 30px 40px; text-align: center;">
                      <h1 style="margin: 0; font-family: 'Cinzel', Georgia, serif; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #C5A059;">PARAGON</h1>
                      <p style="margin: 8px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #94a3b8;">Hub Enterprise OS</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #1e293b;">Welcome to the team, ${toName}!</h2>

                      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                        You've been invited to join <strong>Paragon Hub</strong> as a team member with the following role:
                      </p>

                      <div style="background-color: #f1f5f9; border-radius: 4px; padding: 16px 20px; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: bold;">Your Role</p>
                        <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: bold; color: #7C3732;">${roleDisplay}</p>
                      </div>

                      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                        Click the button below to sign in with your Google account (<strong>${toEmail}</strong>) and get started.
                      </p>

                      <a href="${APP_URL}" style="display: inline-block; background-color: #7C3732; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 14px 28px; border-radius: 4px;">
                        Sign In to Paragon Hub
                      </a>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                        This invitation was sent from Paragon Hub. If you didn't expect this email, you can safely ignore it.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`[SEND EMAIL] Resend API response - data: ${JSON.stringify(data)}, error: ${JSON.stringify(error)}`);

    if (error) {
      console.error('[SEND EMAIL] Resend error:', error);
      return { success: false, reason: error.message };
    }

    console.log(`[SEND EMAIL] SUCCESS! Email sent to ${toEmail}, id: ${data.id}`);
    return { success: true, emailId: data.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, reason: error.message };
  }
};

// GET /api/users - Get all users (for admin user management)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
      .select('email name role status isActive avatarColor invitedAt lastLogin lastSeen createdAt')
      .sort({ createdAt: -1 });

    // Check for stale users - if lastSeen > 10 minutes ago, treat as OFFLINE
    // (matches the logic in /api/auth/users)
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

    // Create invited user with placeholder googleId (will be replaced on first login)
    const user = new User({
      googleId: `invited-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

    // Log audit
    await logAudit({
      user: { id: invitedById },
      action: 'INVITE_USER',
      resourceType: 'User',
      resourceId: user._id,
      resourceName: email,
      details: { role, name },
      req
    });

    // Send invite email
    const emailResult = await sendInviteEmail(email, name, role);

    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      invitedAt: user.invitedAt,
      emailSent: emailResult.success,
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

    // Log audit
    await logAudit({
      action: 'UPDATE_USER',
      resourceType: 'User',
      resourceId: user._id,
      resourceName: user.email,
      details: { changes: updateFields },
      req
    });

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

    // Log audit
    await logAudit({
      action: 'DELETE_USER',
      resourceType: 'User',
      resourceId: user._id,
      resourceName: user.email,
      details: { deletedUserRole: user.role },
      req
    });

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
