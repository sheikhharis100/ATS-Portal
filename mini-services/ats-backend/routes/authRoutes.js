/**
 * ============================================================================
 * Auth Routes — Registration & Login Endpoints
 * ============================================================================
 *
 * BASE URL: /api/auth
 *
 * ENDPOINTS:
 *   POST /api/auth/register  → Register a new user (PUBLIC)
 *   POST /api/auth/login     → Login and get JWT token (PUBLIC)
 *   GET  /api/auth/me        → Get current user info (PRIVATE — needs token)
 *
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ── Public Routes (no authentication needed) ────────────────────────────────
router.post('/register', register);
router.post('/login', login);

// ── Protected Routes (JWT token required in Authorization header) ───────────
router.get('/me', protect, getMe);

module.exports = router;
