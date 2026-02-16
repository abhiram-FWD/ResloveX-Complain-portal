const express = require('express');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  addComment,
  assignComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router
  .route('/')
  .post(protect, upload.array('attachments', 5), createComplaint)
  .get(protect, getComplaints);

router.route('/:id').get(protect, getComplaintById);

router
  .route('/:id/status')
  .put(protect, authorize('authority', 'admin'), updateComplaintStatus);

router.route('/:id/comments').post(protect, addComment);

router
  .route('/:id/assign')
  .put(protect, authorize('admin'), assignComplaint);

module.exports = router;
