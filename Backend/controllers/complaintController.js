const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const generateComplaintId = require('../utils/generateId');
const { getIO } = require('../socket/io');

exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, priority, isAnonymous } = req.body;
    
    // Parse location if it's a string (sent from FormData)
    let parsedLocation = location;
    if (typeof location === 'string') {
      try { parsedLocation = JSON.parse(location); } catch(e) {}
    }
    
    if (!title || !description || !category || !parsedLocation?.address) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    
    const complaintId = await generateComplaintId();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + categoryDoc.slaInDays);
    
    let autoPriority = priority || 'medium';
    if (category === 'Water Supply' || category === 'Electricity') {
      autoPriority = 'high';
    }
    
    const evidencePhotos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        evidencePhotos.push({
          url: file.path,
          publicId: file.filename,
          uploadedBy: req.user._id,
          photoType: 'complaint'
        });
      }
    }
    
    const complaint = await Complaint.create({
      complaintId,
      title,
      description,
      category,
      location: parsedLocation,
      priority: autoPriority,
      isAnonymous: isAnonymous || false,
      citizen: req.user._id,
      sla: {
        expectedDays: categoryDoc.slaInDays,
        deadline
      },
      evidencePhotos,
      timeline: [{
        action: 'submitted',
        performedBy: req.user._id,
        details: 'Complaint submitted by citizen'
      }]
    });
    
    if (parsedLocation.division) {
  const io = getIO();
  if (io) io.to(`division_${parsedLocation.division}`).emit('new_complaint', {
        complaintId: complaint.complaintId,
        title: complaint.title,
        category: complaint.category,
        location: complaint.location
      });
    }
    
    res.status(201).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, division, ward, priority, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (division) filter['location.division'] = division;
    if (ward) filter['location.ward'] = ward;
    if (priority) filter.priority = priority;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const complaints = await Complaint.find(filter)
      .populate('citizen', 'name')
      .populate('currentAuthority', 'name authorityInfo.designation authorityInfo.department authorityInfo.division')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalCount = await Complaint.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({ 
      success: true, 
      complaints, 
      totalCount, 
      page: parseInt(page), 
      totalPages 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id })
      .populate('citizen', 'name')
      .populate('currentAuthority', 'name authorityInfo')
      .populate('timeline.performedBy', 'name authorityInfo.designation authorityInfo.division')
      .populate('timeline.fromAuthority', 'name authorityInfo.designation authorityInfo.division')
      .populate('timeline.toAuthority', 'name authorityInfo.designation authorityInfo.division');
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    
    const slaRemaining = complaint.sla.deadline - new Date();
    const daysRemaining = Math.floor(slaRemaining / (1000 * 60 * 60 * 24));
    
    res.json({ 
      success: true, 
      complaint,
      slaInfo: {
        deadline: complaint.sla.deadline,
        daysRemaining,
        isOverdue: complaint.sla.isOverdue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user._id })
      .populate('currentAuthority', 'name authorityInfo.designation')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
