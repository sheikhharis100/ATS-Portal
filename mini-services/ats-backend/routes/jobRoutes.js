/**
 * ============================================================================
 * Job Routes — Job CRUD Endpoints
 * ============================================================================
 *
 * BASE URL: /api/jobs
 *
 * ENDPOINTS:
 *   GET    /api/jobs       → List all jobs (PUBLIC)
 *   GET    /api/jobs/:id   → Get job details (PUBLIC)
 *   POST   /api/jobs       → Create a job (ADMIN only)
 *   PUT    /api/jobs/:id   → Update a job (ADMIN only)
 *   DELETE /api/jobs/:id   → Delete a job (ADMIN only)
 *
 * MIDDLEWARE CHAIN (for protected routes):
 *   protect → authorize('admin') → controller
 *   1. "protect" verifies JWT token and sets req.user
 *   2. "authorize('admin')" checks if req.user.role === 'admin'
 *   3. Controller function runs
 *
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// ── Public Routes ────────────────────────────────────────────────────────────
// Anyone can view jobs — no authentication needed
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// ── Admin-Only Routes ────────────────────────────────────────────────────────
// ★ Must be logged in (protect) AND must be an admin (authorize)
router.post('/', protect, authorize('admin'), createJob);
router.put('/:id', protect, authorize('admin'), updateJob);
router.delete('/:id', protect, authorize('admin'), deleteJob);

module.exports = router;
