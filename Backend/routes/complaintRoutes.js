const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/', authMiddleware, upload.array('photos', 3), complaintController.createComplaint);
router.get('/', complaintController.getAllComplaints);
router.get('/my', authMiddleware, complaintController.getMyComplaints);
router.get('/:id', complaintController.getComplaintById);

module.exports = router;
