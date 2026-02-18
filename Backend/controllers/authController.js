const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token with id and role
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// ─── REGISTER CITIZEN ───────────────────────────────
// @desc    Register a new citizen
// @route   POST /api/auth/register/citizen
// @access  Public
exports.registerCitizen = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate all required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user with role: citizen
    const user = await User.create({
      name,
      email,
      password,
      role: 'citizen',
      phone: phone || '',
    });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── REGISTER AUTHORITY ─────────────────────────────
// @desc    Register a new authority
// @route   POST /api/auth/register/authority
// @access  Public
exports.registerAuthority = async (req, res) => {
  try {
    const { name, email, password, phone, authorityInfo } = req.body;

    // Validate basic fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Validate authorityInfo fields
    if (!authorityInfo || 
        !authorityInfo.designation || 
        !authorityInfo.department || 
        !authorityInfo.division || 
        !authorityInfo.zone || 
        !authorityInfo.ward || 
        !authorityInfo.jurisdictionArea || 
        !authorityInfo.level || 
        !authorityInfo.categories || 
        authorityInfo.categories.length === 0) {
      return res.status(400).json({ 
        message: 'Please provide all required authority information: designation, department, division, zone, ward, jurisdictionArea, level, and categories' 
      });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user with role: authority and full authorityInfo
    const user = await User.create({
      name,
      email,
      password,
      role: 'authority',
      phone: phone || '',
      authorityInfo,
    });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── LOGIN ──────────────────────────────────────────
// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email (include password)
    const user = await User.findOne({ email }).select('+password');

    // If user not found
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password using the comparePassword method
    const isPasswordMatch = await user.comparePassword(password);

    // If password doesn't match
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Return token, role, and user object without password
    const userResponse = await User.findById(user._id).select('-password');

    res.json({
      token,
      role: user.role,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET CURRENT USER ───────────────────────────────
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware (already has password removed)
    res.json({
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
