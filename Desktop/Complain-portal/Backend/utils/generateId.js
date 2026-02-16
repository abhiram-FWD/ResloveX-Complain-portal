const Complaint = require('../models/Complaint');

/**
 * Generate unique complaint ID in format: REX + year + 4-digit number
 * Example: REX20260001, REX20260002
 */
const generateComplaintId = async () => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Count existing complaints in the current year
    const yearPrefix = `REX${currentYear}`;
    const count = await Complaint.countDocuments({
      complaintId: { $regex: `^${yearPrefix}` }
    });
    
    // Increment count and pad to 4 digits
    const nextNumber = (count + 1).toString().padStart(4, '0');
    
    return `${yearPrefix}${nextNumber}`;
  } catch (error) {
    console.error('Error generating complaint ID:', error);
    // Fallback: use timestamp-based ID if database query fails
    const timestamp = Date.now().toString().slice(-8);
    return `REX${new Date().getFullYear()}${timestamp}`;
  }
};

module.exports = { generateComplaintId };
