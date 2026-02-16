const express = require('express');
const {
  registerCitizen,
  registerAuthority,
  login,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register/citizen', registerCitizen);
router.post('/register/authority', registerAuthority);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
