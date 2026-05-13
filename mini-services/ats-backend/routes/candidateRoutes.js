/**
 * Candidate Routes — Profile & Application Endpoints
 * Cover letter is now plain text (PUT with JSON body, not file upload)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadResume,
  updateCoverLetter,
  applyForJob,
  getMyApplications,
  getApplicationDetail,
} = require('../controllers/candidateController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// Multer Configuration — memory storage for Cloudinary uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Max 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.fieldname === 'profilePicture') {
      if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files (jpg, png, gif, webp) are allowed for profile pictures.'), false);
      }
    } else if (file.fieldname === 'resume') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for resumes.'), false);
      }
    } else {
      cb(new Error('Unknown file field.'), false);
    }
  },
});

// All candidate routes require authentication + candidate role
router.use(protect, authorize('candidate'));

// Profile Routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// File Upload Routes (Cloudinary)
router.put('/profile/picture', upload.single('profilePicture'), uploadProfilePicture);
router.put('/resume', upload.single('resume'), uploadResume);

// Cover Letter — Plain text (NOT file upload)
router.put('/cover-letter', updateCoverLetter);

// Job Application Routes
router.post('/apply/:jobId', applyForJob);
router.get('/applications', getMyApplications);
router.get('/applications/:id', getApplicationDetail);

module.exports = router;
