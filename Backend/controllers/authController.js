const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.registerCitizen = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      name, email, password,
      phone: phone || '',
      role: 'citizen',
      approvalStatus: 'approved'
    });

    const token = generateToken(user._id, user.role);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, token, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.registerAuthority = async (req, res) => {
  try {
    const { name, email, password, phone, authorityInfo } = req.body;

    if (!name || !email || !password || !authorityInfo)
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      name, email, password,
      phone: phone || '',
      role: 'authority',
      approvalStatus: 'pending', // ← requires admin approval
      authorityInfo
    });

    const userObj = user.toObject();
    delete userObj.password;

    // Don't send token — they must wait for approval
    res.status(201).json({
      success: true,
      pending: true,
      message: 'Registration successful! Your account is pending admin approval. You will be able to login once approved.',
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Block pending authority accounts
    if (user.role === 'authority' && user.approvalStatus === 'pending') {
      return res.status(403).json({
        success: false,
        pending: true,
        message: 'Your authority account is pending admin approval. Please wait for approval before logging in.'
      });
    }

    // Block rejected authority accounts
    if (user.role === 'authority' && user.approvalStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        rejected: true,
        message: 'Your authority account application was rejected. Please contact the administrator.'
      });
    }

    const token = generateToken(user._id, user.role);
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ success: true, token, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};