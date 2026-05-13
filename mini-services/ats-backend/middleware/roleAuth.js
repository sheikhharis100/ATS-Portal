/**
 * ============================================================================
 * Role-Based Access Control (RBAC) Middleware
 * ============================================================================
 *
 * PURPOSE: Restricts route access based on user role (candidate or admin).
 *          Used AFTER the "protect" middleware (which verifies the JWT token).
 *
 * HOW IT WORKS:
 *   1. The "protect" middleware runs first and sets req.user
 *   2. This middleware checks if req.user.role matches the allowed roles
 *   3. If role matches → request continues to controller
 *   4. If role doesn't match → returns 403 Forbidden
 *
 * USAGE IN ROUTES:
 *   const { protect } = require('../middleware/auth');
 *   const { authorize } = require('../middleware/roleAuth');
 *
 *   // Only admins can access this route:
 *   router.post('/jobs', protect, authorize('admin'), createJob);
 *
 *   // Both candidates and admins can access:
 *   router.get('/jobs', protect, authorize('candidate', 'admin'), getJobs);
 *
 * API ENDPOINTS THAT USE THIS MIDDLEWARE:
 *   - POST /api/jobs           → authorize('admin')
 *   - PUT /api/jobs/:id        → authorize('admin')
 *   - DELETE /api/jobs/:id     → authorize('admin')
 *   - GET /api/candidate/*     → authorize('candidate')
 *   - GET /api/admin/*         → authorize('admin')
 *
 * ============================================================================
 */

/**
 * Authorize Middleware — Checks if the authenticated user has the required role
 *
 * @param  {...String} roles - Roles that are allowed to access the route
 * @returns {Function} Express middleware
 *
 * EXAMPLES:
 *   authorize('admin')              → Only admins
 *   authorize('candidate')          → Only candidates
 *   authorize('candidate', 'admin') → Both candidates and admins
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the "protect" middleware (must run before this!)
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: 'Authorization middleware used before protect middleware.',
      });
    }

    // Check if the user's role is in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Your role is '${req.user.role}', but this route requires one of: [${roles.join(', ')}].`,
      });
    }

    // Role matches — continue to the next middleware/controller
    next();
  };
};

module.exports = { authorize };
