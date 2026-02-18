const express = require('express');
const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getMyComplaints,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// POST / → protect + upload.array('photos', 3) + createComplaint
router.post('/', protect, upload.array('photos', 3), createComplaint);

// GET / → getAllComplaints (public)
router.get('/', getAllComplaints);

// GET /my → protect + getMyComplaints
router.get('/my', protect, getMyComplaints);

// GET /:id → getComplaintById (public, id = complaintId string)
router.get('/:id', getComplaintById);

module.exports = router;
