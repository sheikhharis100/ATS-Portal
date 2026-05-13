/**
 * ============================================================================
 * Auth Middleware — JWT Token Verification
 * ============================================================================
 *
 * PURPOSE: Protects routes by verifying the JWT token sent in the
 *          Authorization header. Only authenticated users can access
 *          protected routes.
 *
 * HOW IT WORKS:
 *   1. Client sends request with header: Authorization: Bearer <token>
 *   2. This middleware extracts the token
 *   3. Verifies the token using JWT_SECRET from .env
 *   4. Finds the user by the decoded token's userId
 *   5. Attaches the user to req.user so controllers can use it
 *   6. If token is missing/invalid → returns 401 Unauthorized
 *
 * USAGE IN ROUTES:
 *   const { protect } = require('../middleware/auth');
 *   router.get('/profile', protect, getProfile);  // ← protect = requires login
 *
 * API ENDPOINTS THAT USE THIS MIDDLEWARE:
 *   - All /api/candidate/* routes  (candidate must be logged in)
 *   - All /api/admin/* routes      (admin must be logged in)
 *
 * ============================================================================
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Protect Middleware — Verifies JWT token and attaches user to request
 *
 * @param {Object} req  - Express request object
 * @param {Object} res  - Express response object
 * @param {Function} next - Express next middleware function
 */
const protect = async (req, res, next) => {
  let token;

  // ── Step 1: Extract token from Authorization header ──────────────────────
  // Expected format: "Bearer eyJhbGciOiJIUzI1NiIs..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]; // Get the part after "Bearer "
  }

  // ── Step 2: Check if token exists ────────────────────────────────────────
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in.',
    });
  }

  try {
    // ── Step 3: Verify the token using JWT_SECRET from .env ──────────────
    // ★ JWT_SECRET must match the one used during login (in authController)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Step 4: Find the user by ID from the decoded token ───────────────
    // decoded = { id: 'userId123', iat: ..., exp: ... }
    // We use .select('-password') to exclude the password hash
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    // ── Step 5: Check if user account is active ──────────────────────────
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.',
      });
    }

    // ── Step 6: Attach user to request and continue ──────────────────────
    // Now controllers can access req.user.name, req.user.role, etc.
    next();
  } catch (error) {
    // Token is invalid or expired
    return res.status(401).json({
      success: false,
      message: 'Not authorized — token is invalid or expired.',
    });
  }
};

module.exports = { protect };
