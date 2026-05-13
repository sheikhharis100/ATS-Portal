/**
 * Admin Routes — Dashboard, Applications, Interviews Management
 */

const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  scheduleInterview,
  getAllInterviews,
  updateInterview,
  cancelInterview,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Applications Management
router.get('/applications', getAllApplications);
router.get('/applications/:id', getApplicationById);
router.put('/applications/:id/status', updateApplicationStatus);

// Interview Management
router.post('/interviews', scheduleInterview);
router.get('/interviews', getAllInterviews);
router.put('/interviews/:id', updateInterview);
router.delete('/interviews/:id', cancelInterview);

module.exports = router;
