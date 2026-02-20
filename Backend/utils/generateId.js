const Complaint = require('../models/Complaint');

const generateComplaintId = async () => {
  try {
    const count = await Complaint.countDocuments();
    const year = new Date().getFullYear();
    const paddedCount = String(count + 1).padStart(4, '0');
    return `REX${year}${paddedCount}`;
  } catch (error) {
    console.error('Error generating complaint ID:', error);
    return `REX${Date.now()}`;
  }
};

module.exports = generateComplaintId;
