const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { getIO } = require('../socket/io');

exports.getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      $or: [
        {
          category: { $in: req.user.authorityInfo.categories },
          'location.division': req.user.authorityInfo.division,
          status: { $nin: ['resolved', 'rejected'] }
        },
        {
          currentAuthority: req.user._id,
          status: { $nin: ['resolved', 'rejected'] }
        }
      ]
    })
    .populate('citizen', 'name')
    .sort({ priority: -1, 'sla.deadline': 1 });
    
    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.acceptComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (complaint.isResponsibilityLocked) return res.status(400).json({ success: false, message: 'Complaint already accepted by another officer' });
    
    complaint.currentAuthority = req.user._id;
    complaint.isResponsibilityLocked = true;
    complaint.status = 'accepted';
    complaint.timeline.push({
      action: 'accepted',
      performedBy: req.user._id,
      toAuthority: req.user._id,
      details: req.body.note || 'Complaint accepted'
    });
    await complaint.save();
    
    const io = getIO();
    if (io) {
      io.to(`complaint_${complaint.complaintId}`).emit('complaint_updated', {
        complaintId: complaint.complaintId,
        status: 'accepted',
        handler: {
          name: req.user.name,
          designation: req.user.authorityInfo.designation,
          division: req.user.authorityInfo.division
        }
      });
      io.to(`user_${complaint.citizen}`).emit('notification', {
        message: `Your complaint ${complaint.complaintId} was accepted by ${req.user.name}`,
        type: 'success',
        complaintId: complaint.complaintId
      });
    }
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── NEW ──────────────────────────────────────────────
exports.markInProgress = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (!complaint.currentAuthority || complaint.currentAuthority.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only current handler can update this complaint' });
    }

    complaint.status = 'in_progress';
    complaint.timeline.push({
      action: 'in_progress',
      performedBy: req.user._id,
      details: 'Work started on this complaint'
    });
    await complaint.save();

    const io = getIO();
    if (io) {
      io.to(`complaint_${complaint.complaintId}`).emit('complaint_updated', {
        complaintId: complaint.complaintId,
        status: 'in_progress'
      });
      io.to(`user_${complaint.citizen}`).emit('notification', {
        message: `Work has started on your complaint ${complaint.complaintId}`,
        type: 'info',
        complaintId: complaint.complaintId
      });
    }
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ─────────────────────────────────────────────────────

exports.forwardComplaint = async (req, res) => {
  try {
    const { toAuthorityId, reason } = req.body;
    if (!reason || reason.length < 20) return res.status(400).json({ success: false, message: 'Forwarding reason must be at least 20 characters' });
    
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (!complaint.currentAuthority || complaint.currentAuthority.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only current handler can forward this complaint' });
    }
    
    const toAuthority = await User.findOne({
      $or: [
        ...(toAuthorityId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: toAuthorityId }] : []),
        { email: toAuthorityId }
      ],
      role: 'authority'
    });
    if (!toAuthority) return res.status(400).json({ success: false, message: 'No authority found with that email or ID' });
    
    const previousAuthority = complaint.currentAuthority;
    complaint.currentAuthority = toAuthority._id;
    complaint.isResponsibilityLocked = true;
    complaint.timeline.push({
      action: 'forwarded',
      performedBy: req.user._id,
      fromAuthority: previousAuthority,
      toAuthority: toAuthority._id,
      details: reason,
      isVisibleToCitizen: true
    });
    await complaint.save();
    
    const io = getIO();
    if (io) {
      io.to(`complaint_${complaint.complaintId}`).emit('complaint_updated', {
        complaintId: complaint.complaintId,
        status: complaint.status,
        action: 'forwarded'
      });
    }
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (!complaint.currentAuthority || complaint.currentAuthority.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only current handler can resolve this complaint' });
    }
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'At least one resolution photo is required' });
    
    for (const file of req.files) {
      complaint.evidencePhotos.push({
        url: file.path,
        publicId: file.filename,
        uploadedBy: req.user._id,
        photoType: 'resolution'
      });
    }
    complaint.status = 'pending_verification';
    complaint.timeline.push({
      action: 'resolved',
      performedBy: req.user._id,
      details: req.body.note || 'Marked as resolved'
    });
    await complaint.save();
    
    const io = getIO();
    if (io) {
      io.to(`complaint_${complaint.complaintId}`).emit('complaint_updated', {
        complaintId: complaint.complaintId,
        status: 'pending_verification'
      });
      io.to(`user_${complaint.citizen}`).emit('notification', {
        message: `Your complaint ${complaint.complaintId} is marked resolved. Please verify.`,
        type: 'info',
        complaintId: complaint.complaintId
      });
    }
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyResolution = async (req, res) => {
  try {
    const { isResolved, rating, feedback } = req.body;
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (complaint.citizen.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Only the complaint owner can verify resolution' });
    if (complaint.status !== 'pending_verification') return res.status(400).json({ success: false, message: 'Complaint is not in pending verification state' });
    
    if (isResolved) {
      complaint.status = 'resolved';
      complaint.citizenVerification.isVerified = true;
      complaint.citizenVerification.verifiedAt = new Date();
      if (rating) complaint.citizenVerification.rating = rating;
      if (feedback) complaint.citizenVerification.feedback = feedback;
      
      const wasOnTime = new Date() <= complaint.sla.deadline;
      await User.findByIdAndUpdate(complaint.currentAuthority, {
        $inc: {
          'stats.totalHandled': 1,
          'stats.resolvedOnTime': wasOnTime ? 1 : 0,
          'stats.totalRating': rating || 0,
          'stats.ratingCount': rating ? 1 : 0
        }
      });
      complaint.timeline.push({ action: 'verified', performedBy: req.user._id, details: 'Resolution verified by citizen' });
    } else {
      complaint.status = 'reopened';
      complaint.isResponsibilityLocked = false;
      await User.findByIdAndUpdate(complaint.currentAuthority, {
        $inc: { 'stats.falseClosuresCaught': 1 }
      });
      complaint.timeline.push({ action: 'reopened', performedBy: req.user._id, details: req.body.reason || 'Citizen rejected the resolution' });
    }
    await complaint.save();
    
    const io = getIO();
    if (io) {
      io.to(`complaint_${complaint.complaintId}`).emit('complaint_updated', {
        complaintId: complaint.complaintId,
        status: complaint.status
      });
    }
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAuthorityStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const stats = { ...user.stats, averageRating: user.averageRating };
    const complaintsByStatus = await Complaint.aggregate([
      { $match: { currentAuthority: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, stats, complaintsByStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPublicDashboard = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const totalResolved = await Complaint.countDocuments({ status: 'resolved' });
    const activeComplaints = await Complaint.countDocuments({ 
      status: { $in: ['submitted', 'assigned', 'accepted', 'in_progress'] } 
    });
    
    const resolvedComplaints = await Complaint.find({ status: 'resolved' });
    let totalDays = 0;
    let onTimeCount = 0;
    for (const complaint of resolvedComplaints) {
      const days = (complaint.updatedAt - complaint.createdAt) / (1000 * 60 * 60 * 24);
      totalDays += days;
      if (complaint.updatedAt <= complaint.sla.deadline) onTimeCount++;
    }
    
    const avgResolutionDays = totalResolved > 0 ? (totalDays / totalResolved).toFixed(1) : 0;
    const onTimePercentage = totalResolved > 0 ? ((onTimeCount / totalResolved) * 100).toFixed(1) : 0;
    
    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', total: { $sum: 1 }, resolved: { 
        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
      }}}
    ]);
    
    const byDepartment = await Complaint.aggregate([
      { $lookup: { from: 'categories', localField: 'category', foreignField: 'name', as: 'categoryInfo' } },
      { $unwind: '$categoryInfo' },
      { $group: { _id: '$categoryInfo.defaultDepartment', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } } } }
    ]);
    
    const recentResolved = await Complaint.find({ status: 'resolved' })
      .populate('currentAuthority', 'name authorityInfo.designation authorityInfo.division')
      .sort({ updatedAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      stats: { totalComplaints, totalResolved, activeComplaints, avgResolutionDays: parseFloat(avgResolutionDays), onTimePercentage: parseFloat(onTimePercentage) },
      byCategory,
      byDepartment,
      recentResolved
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOfficerScorecard = async (req, res) => {
  try {
    const officer = await User.findOne({ _id: req.params.id, role: 'authority' });
    if (!officer) return res.status(404).json({ success: false, message: 'Officer not found' });
    
    res.json({ success: true, scorecard: {
      name: officer.name,
      designation: officer.authorityInfo.designation,
      department: officer.authorityInfo.department,
      division: officer.authorityInfo.division,
      zone: officer.authorityInfo.zone,
      ward: officer.authorityInfo.ward,
      stats: officer.stats,
      averageRating: officer.averageRating
    }});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};