const mongoose = require('mongoose');

// Avatar colors pool - distinct, professional colors
const AVATAR_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#A855F7', // purple
  '#22C55E', // green
  '#E11D48', // rose
  '#0EA5E9', // sky
  '#D946EF', // fuchsia
];

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true,  // Allow null for invited but not yet logged in users
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    default: '',
  },
  avatarColor: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['ADMIN', 'OPERATIONS', 'SALES', 'ACCOUNTING', 'CLIENT'],
    default: 'SALES',
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'],
    default: 'OFFLINE',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  invitedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
});

// Static method to get next available avatar color
userSchema.statics.getNextAvatarColor = async function() {
  const usedColors = await this.distinct('avatarColor');
  const availableColors = AVATAR_COLORS.filter(c => !usedColors.includes(c));

  if (availableColors.length > 0) {
    return availableColors[0];
  }

  // If all colors used, pick the least recently used one
  const oldestUser = await this.findOne().sort({ createdAt: 1 });
  return oldestUser?.avatarColor || AVATAR_COLORS[0];
};

module.exports = mongoose.model('User', userSchema);
