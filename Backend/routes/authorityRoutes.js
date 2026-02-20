const express = require('express');
const router = express.Router();
const authorityController = require('../controllers/authorityController');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorityOnly, adminOnly } = require('../middleware/roleMiddleware');
const { upload } = require('../config/cloudinary');

// ── Authority routes ──
router.get('/complaints',        authMiddleware, authorityOnly, authorityController.getAssignedComplaints);
router.post('/accept/:id',       authMiddleware, authorityOnly, authorityController.acceptComplaint);
router.post('/inprogress/:id',   authMiddleware, authorityOnly, authorityController.markInProgress);
router.post('/forward/:id',      authMiddleware, authorityOnly, authorityController.forwardComplaint);
router.post('/resolve/:id',      authMiddleware, authorityOnly, upload.array('photos', 3), authorityController.resolveComplaint);
router.post('/verify/:id',       authMiddleware, authorityController.verifyResolution);
router.get('/stats',             authMiddleware, authorityOnly, authorityController.getAuthorityStats);
router.get('/scorecard/:id',     authorityController.getOfficerScorecard);
router.get('/dashboard/public',  authorityController.getPublicDashboard);

// ── Admin routes ──
router.get('/admin/pending',          authMiddleware, adminOnly, adminController.getPendingAuthorities);
router.get('/admin/all-authorities',  authMiddleware, adminOnly, adminController.getAllAuthorities);
router.post('/admin/approve/:id',     authMiddleware, adminOnly, adminController.approveAuthority);
router.post('/admin/reject/:id',      authMiddleware, adminOnly, adminController.rejectAuthority);
router.delete('/admin/delete/:id',    authMiddleware, adminOnly, adminController.deleteAuthority);

module.exports = router;