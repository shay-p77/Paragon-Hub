require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const announcementRoutes = require('./routes/announcements');
const commentRoutes = require('./routes/comments');
const requestRoutes = require('./routes/requests');
const knowledgeRoutes = require('./routes/knowledge');
const parseRoutes = require('./routes/parse');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://paragon-hub.netlify.app',
    /\.netlify\.app$/,
    /\.railway\.app$/
  ],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/parse', parseRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Paragon Hub API', status: 'running' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server immediately (Railway needs this)
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
