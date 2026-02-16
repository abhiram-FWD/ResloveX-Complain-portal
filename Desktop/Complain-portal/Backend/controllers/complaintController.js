const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const User = require('../models/User');
const { upload } = require('../config/cloudinary');
const { generateComplaintId } = require('../utils/generateId');
const { io } = require('../server');

// ─── CREATE COMPLAINT ───────────────────────────────
// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, priority, isAnonymous } = req.body;

    // Validate required fields
    if (!title || !description || !category || !location || !location.address) {
      return res.status(400).json({ 
        message: 'Please provide title, description, category, and location address' 
      });
    }

    // Fetch category SLA from Category model
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Calculate deadline based on SLA days
    const slaInDays = categoryDoc.slaInDays;
    const deadline = new Date(Date.now() + slaInDays * 86400000);

    // Auto-set priority based on category
    let autoPriority = priority || 'medium';
    if (category === 'Water Supply' || category === 'Electricity') {
      autoPriority = 'high';
    }

    // Generate complaint ID (await since it's async now)
    const complaintId = await generateComplaintId();

    // Handle uploaded photos
    const evidencePhotos = req.files ? req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      uploadedBy: req.user._id,
      uploadedAt: Date.now(),
      photoType: 'complaint'
    })) : [];

    // Create complaint with first timeline entry
    const complaint = await Complaint.create({
      complaintId,
      title,
      description,
      category,
      location,
      priority: autoPriority,
      isAnonymous: isAnonymous || false,
      citizen: req.user._id,
      evidencePhotos,
      sla: {
        expectedDays: slaInDays,
        deadline,
        isOverdue: false
      },
      timeline: [{
        action: 'submitted',
        performedBy: req.user._id,
        timestamp: Date.now(),
        details: 'Complaint submitted by citizen',
        isVisibleToCitizen: true
      }]
    });

    // Emit socket event to authorities in same division
    if (location.division) {
      io.to(`division_${location.division}`).emit('new_complaint', {
        complaintId,
        title,
        category,
        location
      });
    }

    // Populate and return
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('citizen', 'name')
      .select('-__v');

    res.status(201).json(populatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET ALL COMPLAINTS (public) ────────────────────
// @desc    Get all complaints with filtering and pagination
// @route   GET /api/complaints
// @access  Public
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, division, ward, priority, page = 1, limit = 10 } = req.query;
    
    const filter = {};

    // Apply filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (division) filter['location.division'] = division;
    if (ward) filter['location.ward'] = ward;
    if (priority) filter.priority = priority;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalCount = await Complaint.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // Fetch complaints
    const complaints = await Complaint.find(filter)
      .populate('citizen', 'name')
      .populate('currentAuthority', 'name authorityInfo.designation authorityInfo.department authorityInfo.division')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    res.json({
      complaints,
      totalCount,
      page: parseInt(page),
      totalPages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET SINGLE COMPLAINT (public) ──────────────────
// @desc    Get single complaint by complaintId with SLA calculations
// @route   GET /api/complaints/:id
// @access  Public
exports.getComplaintById = async (req, res) => {
  try {
    // Find by complaintId string (e.g., REX20240001), not MongoDB _id
    const complaint = await Complaint.findOne({ complaintId: req.params.id })
      .populate('citizen', 'name')
      .populate('currentAuthority', 'name authorityInfo')
      .populate('timeline.performedBy', 'name authorityInfo.designation authorityInfo.division')
      .populate('timeline.fromAuthority', 'name authorityInfo.designation authorityInfo.division')
      .populate('timeline.toAuthority', 'name authorityInfo.designation authorityInfo.division')
      .select('-__v');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Calculate time spent for each timeline entry
    const timelineWithTimeSpent = complaint.timeline.map((entry, index) => {
      let timeSpent = null;
      if (index > 0) {
        const previousEntry = complaint.timeline[index - 1];
        const timeDiff = new Date(entry.timestamp) - new Date(previousEntry.timestamp);
        timeSpent = Math.floor(timeDiff / 1000); // in seconds
      }
      return {
        ...entry.toObject(),
        timeSpent
      };
    });

    // Calculate SLA remaining
    const now = new Date();
    const deadline = new Date(complaint.sla.deadline);
    const timeRemaining = deadline - now;
    const daysRemaining = Math.floor(timeRemaining / 86400000);
    const hoursRemaining = Math.floor((timeRemaining % 86400000) / 3600000);
    const isOverdue = timeRemaining < 0;
    
    const totalSlaTime = deadline - new Date(complaint.createdAt);
    const timeUsed = now - new Date(complaint.createdAt);
    const percentUsed = Math.min(100, Math.max(0, (timeUsed / totalSlaTime) * 100));

    const slaRemaining = {
      daysRemaining: Math.abs(daysRemaining),
      hoursRemaining: Math.abs(hoursRemaining),
      isOverdue,
      percentUsed: Math.round(percentUsed)
    };

    // Return enriched complaint data
    const complaintData = complaint.toObject();
    complaintData.timeline = timelineWithTimeSpent;
    complaintData.slaRemaining = slaRemaining;

    res.json(complaintData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET MY COMPLAINTS (citizen) ────────────────────
// @desc    Get complaints for logged-in citizen
// @route   GET /api/complaints/my
// @access  Private
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user._id })
      .populate('currentAuthority', 'name authorityInfo.designation')
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
