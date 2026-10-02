/**
 * ATS Backend — Mini Service Entry Point
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { isDbConnected } = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const branchRoutes = require('./routes/branchRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Configure Cloudinary
configureCloudinary();

// Middleware
// CLIENT_URL accepts a comma-separated list of allowed origins. Vercel preview
// deployments get a fresh subdomain on every push, so *.vercel.app is allowed
// too — otherwise the frontend breaks every time its URL changes.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Non-browser callers (curl, server-to-server) send no Origin header.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return callback(null, true);
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve locally-stored uploads (used when Cloudinary is not configured).
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Root — lets uptime pings and manual checks confirm the service is alive.
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'ATS API. See /api/health.' });
});

// Health Check — always answers, even when the database is unreachable, so the
// cause of an outage is visible from outside the host.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ATS API is running!',
    database: isDbConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Everything under /api past this point needs the database. Answer with a
// specific 503 instead of letting each query fail with an opaque driver error.
app.use('/api', (req, res, next) => {
  if (isDbConnected()) return next();
  return res.status(503).json({
    success: false,
    message:
      'Database unavailable. The API is running but cannot reach MongoDB. ' +
      'See /api/health.',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.',
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ATS Server running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
});
