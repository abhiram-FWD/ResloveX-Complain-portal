const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @desc    Get all authorities
// @route   GET /api/authority
// @access  Private (Admin)
const getAuthorities = async (req, res) => {
  try {
    const authorities = await User.find({ role: 'authority' })
      .select('-password')
      .populate('assignedCategory', 'name');

    res.json(authorities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get authority dashboard stats
// @route   GET /api/authority/dashboard
// @access  Private (Authority)
const getAuthorityDashboard = async (req, res) => {
  try {
    const totalAssigned = await Complaint.countDocuments({
      assignedTo: req.user._id,
    });

    const pending = await Complaint.countDocuments({
      assignedTo: req.user._id,
      status: 'pending',
    });

    const inProgress = await Complaint.countDocuments({
      assignedTo: req.user._id,
      status: 'in-progress',
    });

    const resolved = await Complaint.countDocuments({
      assignedTo: req.user._id,
      status: 'resolved',
    });

    const recentComplaints = await Complaint.find({
      assignedTo: req.user._id,
    })
      .populate('user', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalAssigned,
        pending,
        inProgress,
        resolved,
      },
      recentComplaints,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update authority profile
// @route   PUT /api/authority/:id
// @access  Private (Admin)
const updateAuthority = async (req, res) => {
  try {
    const { assignedCategory, isVerified } = req.body;

    const authority = await User.findById(req.params.id);

    if (!authority || authority.role !== 'authority') {
      return res.status(404).json({ message: 'Authority not found' });
    }

    if (assignedCategory) authority.assignedCategory = assignedCategory;
    if (typeof isVerified !== 'undefined') authority.isVerified = isVerified;

    await authority.save();

    res.json(authority);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAuthorities,
  getAuthorityDashboard,
  updateAuthority,
};
