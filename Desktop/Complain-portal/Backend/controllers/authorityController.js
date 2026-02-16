const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Category = require('../models/Category');
const { upload } = require('../config/cloudinary');
const { io } = require('../server');

// Helper function used by multiple controllers
const emitComplaintUpdate = (complaintId, data) => {
  io.to(`complaint_${complaintId}`).emit('complaint_updated', data);
};

// ─── GET ASSIGNED COMPLAINTS ────────────────────────
// @desc    Get complaints assigned to authority
// @route   GET /api/authority/complaints
// @access  Private (Authority)
exports.getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      category: { $in: req.user.authorityInfo.categories },
      'location.division': req.user.authorityInfo.division,
      status: { $nin: ['resolved', 'rejected'] }
    })
      .populate('citizen', 'name')
      .sort({ priority: -1, 'sla.deadline': 1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ACCEPT COMPLAINT ───────────────────────────────
// @desc    Accept a complaint (RESPONSIBILITY LOCK)
// @route   POST /api/authority/accept/:id
// @access  Private (Authority)
exports.acceptComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if already locked
    if (complaint.isResponsibilityLocked) {
      return res.status(400).json({ message: 'Already accepted by another officer' });
    }

    // Verify category match
    if (!req.user.authorityInfo.categories.includes(complaint.category)) {
      return res.status(403).json({ message: 'Category not in your jurisdiction' });
    }

    // RESPONSIBILITY LOCK
    complaint.currentAuthority = req.user._id;
    complaint.isResponsibilityLocked = true;
    complaint.status = 'accepted';

    // Add timeline entry
    complaint.timeline.push({
      action: 'accepted',
      performedBy: req.user._id,
      toAuthority: req.user._id,
      timestamp: Date.now(),
      details: req.body.note || 'Complaint accepted',
      isVisibleToCitizen: true
    });

    await complaint.save();

    // Emit socket events
    io.to(`complaint_${complaint.complaintId}`).emit('complaint_updated', {
      complaintId: complaint.complaintId,
      status: 'accepted',
      action: 'accepted',
      handler: {
        name: req.user.name,
        designation: req.user.authorityInfo.designation,
        division: req.user.authorityInfo.division
      }
    });

    io.to(`user_${complaint.citizen}`).emit('notification', {
      message: `Your complaint ${complaint.complaintId} was accepted by ${req.user.name} (${req.user.authorityInfo.designation})`,
      type: 'success',
      complaintId: complaint.complaintId
    });

    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FORWARD COMPLAINT ──────────────────────────────
// @desc    Forward complaint to another authority (UNLOCK/RELOCK)
// @route   POST /api/authority/forward/:id
// @access  Private (Authority)
exports.forwardComplaint = async (req, res) => {
  try {
    const { toAuthorityId, reason } = req.body;

    // Validate reason
    if (!reason || reason.length < 20) {
      return res.status(400).json({ message: 'Reason must be at least 20 characters' });
    }

    const complaint = await Complaint.findOne({ complaintId: req.params.id });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify current handler
    if (complaint.currentAuthority.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not the current handler' });
    }

    // Verify toAuthority exists
    const toAuthority = await User.findById(toAuthorityId);
    if (!toAuthority || toAuthority.role !== 'authority') {
      return res.status(400).json({ message: 'Invalid authority' });
    }

    const previousAuthority = complaint.currentAuthority;

    // UNLOCK → UPDATE → RELOCK
    complaint.isResponsibilityLocked = false;
    complaint.currentAuthority = toAuthorityId;
    complaint.isResponsibilityLocked = true;

    // Add timeline entry
    complaint.timeline.push({
      action: 'forwarded',
      performedBy: req.user._id,
      fromAuthority: previousAuthority,
      toAuthority: toAuthorityId,
      timestamp: Date.now(),
      details: reason,
      isVisibleToCitizen: true
    });

    await complaint.save();

    // Emit socket events
    io.to(`complaint_${complaint.complaintId}`).emit('complaint_updated', {
      complaintId: complaint.complaintId,
      status: complaint.status,
      action: 'forwarded',
      from: req.user.name,
      to: toAuthority.name
    });

    io.to(`user_${previousAuthority}`).emit('notification', {
      message: `Complaint ${complaint.complaintId} forwarded successfully`,
      type: 'info',
      complaintId: complaint.complaintId
    });

    io.to(`user_${toAuthorityId}`).emit('notification', {
      message: `Complaint ${complaint.complaintId} forwarded to you by ${req.user.name}`,
      type: 'info',
      complaintId: complaint.complaintId
    });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── RESOLVE COMPLAINT ──────────────────────────────
// @desc    Mark complaint as resolved (SOFT CLOSE)
// @route   POST /api/authority/resolve/:id
// @access  Private (Authority)
exports.resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify current handler
    if (complaint.currentAuthority.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not the current handler' });
    }

    // Require at least 1 photo
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one resolution photo is required' });
    }

    // Add resolution photos
    const resolutionPhotos = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      uploadedBy: req.user._id,
      uploadedAt: Date.now(),
      photoType: 'resolution'
    }));

    complaint.evidencePhotos.push(...resolutionPhotos);

    // SOFT CLOSE - pending citizen verification
    complaint.status = 'pending_verification';

    // Add timeline entry
    complaint.timeline.push({
      action: 'resolved',
      performedBy: req.user._id,
      timestamp: Date.now(),
      details: req.body.note || 'Complaint resolved',
      isVisibleToCitizen: true
    });

    await complaint.save();

    // Emit socket events
    io.to(`complaint_${complaint.complaintId}`).emit('complaint_updated', {
      complaintId: complaint.complaintId,
      status: 'pending_verification',
      action: 'resolved'
    });

    io.to(`user_${complaint.citizen}`).emit('notification', {
      message: `Your complaint ${complaint.complaintId} is marked resolved. Please verify.`,
      type: 'success',
      complaintId: complaint.complaintId
    });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── CITIZEN VERIFY RESOLUTION ──────────────────────
// @desc    Citizen verifies resolution (HARD CLOSE or REOPEN)
// @route   POST /api/authority/verify/:id
// @access  Private (Citizen)
exports.verifyResolution = async (req, res) => {
  try {
    const { isResolved, rating, feedback, reason } = req.body;

    const complaint = await Complaint.findOne({ complaintId: req.params.id });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify citizen ownership
    if (complaint.citizen.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your complaint' });
    }

    // Verify status
    if (complaint.status !== 'pending_verification') {
      return res.status(400).json({ message: 'Complaint is not pending verification' });
    }

    const now = new Date();
    const isBeforeDeadline = now <= new Date(complaint.sla.deadline);

    if (isResolved === true) {
      // HARD CLOSE - Citizen confirms resolution
      complaint.status = 'resolved';
      complaint.citizenVerification = {
        isVerified: true,
        verifiedAt: now,
        rating: rating || null,
        feedback: feedback || ''
      };

      // Update authority stats
      await User.findByIdAndUpdate(complaint.currentAuthority, {
        $inc: {
          'stats.totalHandled': 1,
          'stats.resolvedOnTime': isBeforeDeadline ? 1 : 0,
          'stats.totalRating': rating || 0,
          'stats.ratingCount': rating ? 1 : 0
        }
      });

      // Add timeline entry
      complaint.timeline.push({
        action: 'verified',
        performedBy: req.user._id,
        timestamp: now,
        details: 'Resolution verified by citizen',
        isVisibleToCitizen: true
      });

      await complaint.save();

      // Emit socket
      io.to(`complaint_${complaint.complaintId}`).emit('complaint_updated', {
        complaintId: complaint.complaintId,
        status: 'resolved',
        action: 'verified'
      });

      res.json({ message: 'Resolution verified successfully', complaint });

    } else {
      // REOPEN - Citizen rejects resolution
      complaint.status = 'reopened';
      complaint.isResponsibilityLocked = false; // UNLOCK for reassignment

      // Increment false closure stat
      await User.findByIdAndUpdate(complaint.currentAuthority, {
        $inc: { 'stats.falseClosuresCaught': 1 }
      });

      // Add timeline entry
      complaint.timeline.push({
        action: 'reopened',
        performedBy: req.user._id,
        timestamp: now,
        details: reason || 'Citizen rejected resolution',
        isVisibleToCitizen: true
      });

      await complaint.save();

      // Emit socket
      io.to(`complaint_${complaint.complaintId}`).emit('complaint_updated', {
        complaintId: complaint.complaintId,
        status: 'reopened',
        action: 'reopened'
      });

      io.to(`user_${complaint.currentAuthority}`).emit('notification', {
        message: `Citizen rejected your resolution for complaint ${complaint.complaintId}`,
        type: 'warning',
        complaintId: complaint.complaintId
      });

      res.json({ message: 'Complaint reopened', complaint });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET AUTHORITY STATS ────────────────────────────
// @desc    Get authority personal stats
// @route   GET /api/authority/stats
// @access  Private (Authority)
exports.getAuthorityStats = async (req, res) => {
  try {
    const stats = {
      ...req.user.stats,
      averageRating: req.user.averageRating
    };

    // Count by status
    const statusCounts = await Complaint.aggregate([
      { $match: { currentAuthority: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const countsByStatus = {};
    statusCounts.forEach(item => {
      countsByStatus[item._id] = item.count;
    });

    res.json({ stats, countsByStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── PUBLIC DASHBOARD ───────────────────────────────
// @desc    Get public transparency dashboard
// @route   GET /api/authority/dashboard/public
// @access  Public
exports.getPublicDashboard = async (req, res) => {
  try {
    const [
      totalComplaints,
      resolvedCount,
      avgResolutionDays,
      onTimePercentage,
      categoryBreakdown,
      departmentBreakdown,
      recentResolved
    ] = await Promise.all([
      // Total complaints
      Complaint.countDocuments(),

      // Resolved count
      Complaint.countDocuments({ status: 'resolved' }),

      // Average resolution days
      Complaint.aggregate([
        { $match: { status: 'resolved' } },
        {
          $project: {
            days: {
              $divide: [
                { $subtract: ['$citizenVerification.verifiedAt', '$createdAt'] },
                86400000
              ]
            }
          }
        },
        { $group: { _id: null, avgDays: { $avg: '$days' } } }
      ]),

      // On-time percentage
      Complaint.aggregate([
        { $match: { status: 'resolved' } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            onTime: {
              $sum: {
                $cond: [
                  { $lte: ['$citizenVerification.verifiedAt', '$sla.deadline'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Category breakdown
      Complaint.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
            }
          }
        }
      ]),

      // Department breakdown
      Complaint.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'currentAuthority',
            foreignField: '_id',
            as: 'authority'
          }
        },
        { $unwind: { path: '$authority', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$authority.authorityInfo.department',
            total: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
            }
          }
        }
      ]),

      // Recent resolved complaints
      Complaint.find({ status: 'resolved' })
        .populate('currentAuthority', 'name authorityInfo.designation')
        .sort({ 'citizenVerification.verifiedAt': -1 })
        .limit(5)
        .select('complaintId title category citizenVerification.verifiedAt')
    ]);

    const avgDays = avgResolutionDays[0]?.avgDays || 0;
    const onTimeData = onTimePercentage[0] || { total: 0, onTime: 0 };
    const onTimePercent = onTimeData.total > 0
      ? (onTimeData.onTime / onTimeData.total) * 100
      : 0;

    res.json({
      totalComplaints,
      resolvedCount,
      avgResolutionDays: Math.round(avgDays * 10) / 10,
      onTimePercentage: Math.round(onTimePercent * 10) / 10,
      categoryBreakdown,
      departmentBreakdown,
      recentResolved
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── OFFICER SCORECARD (public) ─────────────────────
// @desc    Get public officer scorecard
// @route   GET /api/authority/scorecard/:id
// @access  Public
exports.getOfficerScorecard = async (req, res) => {
  try {
    const officer = await User.findOne({
      _id: req.params.id,
      role: 'authority'
    }).select('name authorityInfo stats');

    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }

    res.json({
      name: officer.name,
      designation: officer.authorityInfo.designation,
      department: officer.authorityInfo.department,
      division: officer.authorityInfo.division,
      zone: officer.authorityInfo.zone,
      ward: officer.authorityInfo.ward,
      stats: officer.stats,
      averageRating: officer.averageRating
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
