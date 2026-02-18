const express = require('express');
const {
  getAssignedComplaints,
  acceptComplaint,
  forwardComplaint,
  resolveComplaint,
  verifyResolution,
  getAuthorityStats,
  getPublicDashboard,
  getOfficerScorecard,
} = require('../controllers/authorityController');
const { protect } = require('../middleware/authMiddleware');
const { authorityOnly } = require('../middleware/roleMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Authority-only routes
router.get('/complaints', protect, authorityOnly, getAssignedComplaints);
router.post('/accept/:id', protect, authorityOnly, acceptComplaint);
router.post('/forward/:id', protect, authorityOnly, forwardComplaint);
router.post('/resolve/:id', protect, authorityOnly, upload.array('photos', 3), resolveComplaint);
router.get('/stats', protect, authorityOnly, getAuthorityStats);

// Citizen can verify resolution
router.post('/verify/:id', protect, verifyResolution);

// Public routes
router.get('/scorecard/:id', getOfficerScorecard);
router.get('/dashboard/public', getPublicDashboard);

module.exports = router;
