const Complaint = require('../models/Complaint');
const { generateComplaintId } = require('../utils/generateId');
const { sendNotification } = require('../utils/sendNotification');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, priority } = req.body;

    const complaint = await Complaint.create({
      complaintId: generateComplaintId(),
      title,
      description,
      category,
      location,
      priority: priority || 'medium',
      user: req.user._id,
      attachments: req.files ? req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
        fileType: file.mimetype,
      })) : [],
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('user', 'name email')
      .populate('category', 'name');

    // Send notification to authorities
    sendNotification('new_complaint', populatedComplaint);

    res.status(201).json(populatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const filter = {};

    // Filter by user role
    if (req.user.role === 'user') {
      filter.user = req.user._id;
    } else if (req.user.role === 'authority') {
      filter.assignedTo = req.user._id;
    }

    // Apply additional filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email phone')
      .populate('category', 'name')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('category', 'name description')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Authority/Admin)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    if (status === 'resolved') {
      complaint.resolvedAt = Date.now();
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('user', 'name email')
      .populate('category', 'name');

    // Send notification to user
    sendNotification('status_update', updatedComplaint);

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.comments.push({
      user: req.user._id,
      text,
    });

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('comments.user', 'name');

    // Send notification
    sendNotification('new_comment', updatedComplaint);

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign complaint to authority
// @route   PUT /api/complaints/:id/assign
// @access  Private (Admin)
const assignComplaint = async (req, res) => {
  try {
    const { authorityId } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.assignedTo = authorityId;
    complaint.status = 'in-progress';

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('assignedTo', 'name email');

    // Send notification
    sendNotification('complaint_assigned', updatedComplaint);

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  addComment,
  assignComplaint,
};
