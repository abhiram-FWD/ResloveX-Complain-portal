const User = require('../models/User');

exports.getPendingAuthorities = async (req, res) => {
  try {
    const pending = await User.find({ role: 'authority', approvalStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, authorities: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllAuthorities = async (req, res) => {
  try {
    const authorities = await User.find({ role: 'authority' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, authorities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveAuthority = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'authority' });
    if (!user) return res.status(404).json({ success: false, message: 'Authority not found' });

    user.approvalStatus = 'approved';
    user.isActive = true;
    await user.save();

    res.json({ success: true, message: `${user.name}'s account has been approved.`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectAuthority = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findOne({ _id: req.params.id, role: 'authority' });
    if (!user) return res.status(404).json({ success: false, message: 'Authority not found' });

    user.approvalStatus = 'rejected';
    user.isActive = false;
    await user.save();

    res.json({ success: true, message: `${user.name}'s account has been rejected.`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAuthority = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: 'authority' });
    if (!user) return res.status(404).json({ success: false, message: 'Authority not found' });
    res.json({ success: true, message: `${user.name}'s account has been deleted.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};