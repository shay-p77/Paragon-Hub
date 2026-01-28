require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { auditMiddleware } = require('./utils/auditLogger');
const { ipAllowlistMiddleware } = require('./utils/ipAllowlist');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const announcementRoutes = require('./routes/announcements');
const commentRoutes = require('./routes/comments');
const requestRoutes = require('./routes/requests');
const knowledgeRoutes = require('./routes/knowledge');
const parseRoutes = require('./routes/parse');
const aiRoutes = require('./routes/ai');
const customerRoutes = require('./routes/customers');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (required for Railway, Heroku, etc. to get real client IP)
app.set('trust proxy', 1);

// Security headers (helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }, // Allow Google OAuth popups
  contentSecurityPolicy: false, // Disable CSP for API-only server
}));

// Rate limiting for login only (prevent brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per window
  message: { error: 'Too many login attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== 'POST' || req.path !== '/google', // Only limit POST /google
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Allowed origins - ONLY specific trusted domains (no wildcards)
const allowedOrigins = [
  // Development
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  // Production - add your specific domains here
  'https://paragon-hub.netlify.app',
  'https://hub.paragonconcierge.com',
  'https://www.paragonconcierge.com',
];

// Add any additional allowed origins from environment variable
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach(origin => {
    allowedOrigins.push(origin.trim());
  });
}

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Audit logging middleware
app.use(auditMiddleware);

// Routes
app.use('/api/auth', loginLimiter, authRoutes); // Rate limit login attempts only
app.use('/api', apiLimiter); // General rate limiting on all API routes
app.use('/api/users', ipAllowlistMiddleware, userRoutes); // IP restricted admin routes
app.use('/api/announcements', announcementRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/parse', parseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/notifications', notificationRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Paragon Hub API', status: 'running' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server immediately
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    server.close();
    process.exit(1);
  });
