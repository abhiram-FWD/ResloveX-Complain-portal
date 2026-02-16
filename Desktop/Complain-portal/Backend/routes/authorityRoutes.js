const express = require('express');
const {
  getAuthorities,
  getAuthorityDashboard,
  updateAuthority,
} = require('../controllers/authorityController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/').get(protect, authorize('admin'), getAuthorities);

router.route('/dashboard').get(protect, authorize('authority'), getAuthorityDashboard);

router.route('/:id').put(protect, authorize('admin'), updateAuthority);

module.exports = router;
