/**
 * ============================================================================
 * Branch Routes — Branch CRUD Endpoints
 * ============================================================================
 *
 * BASE URL: /api/branches
 *
 * ENDPOINTS:
 *   GET    /api/branches       → List all branches (PUBLIC)
 *   GET    /api/branches/:id   → Get branch details (PUBLIC)
 *   POST   /api/branches       → Create a branch (ADMIN only)
 *   PUT    /api/branches/:id   → Update a branch (ADMIN only)
 *   DELETE /api/branches/:id   → Delete a branch (ADMIN only)
 *
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} = require('../controllers/branchController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// ── Public Routes ────────────────────────────────────────────────────────────
router.get('/', getAllBranches);
router.get('/:id', getBranchById);

// ── Admin-Only Routes ────────────────────────────────────────────────────────
router.post('/', protect, authorize('admin'), createBranch);
router.put('/:id', protect, authorize('admin'), updateBranch);
router.delete('/:id', protect, authorize('admin'), deleteBranch);

module.exports = router;
