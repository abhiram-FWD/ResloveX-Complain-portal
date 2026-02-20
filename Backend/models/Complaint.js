const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  category: { 
    type: String, 
    required: true,
    enum: ['Road Maintenance', 'Street Lights', 'Water Supply', 
           'Garbage Collection', 'Drainage', 'Electricity', 'Other']
  },
  
  location: {
    address: { type: String, required: true },
    division: String,
    zone: String,
    ward: String,
    latitude: Number,
    longitude: Number
  },
  
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentAuthority: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isResponsibilityLocked: { type: Boolean, default: false },
  
  status: { 
    type: String,
    enum: ['submitted', 'assigned', 'accepted', 'in_progress', 'pending_verification', 
           'resolved', 'rejected', 'escalated', 'reopened'],
    default: 'submitted'
  },
  
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  
  sla: {
    expectedDays: Number,
    deadline: Date,
    isOverdue: { type: Boolean, default: false },
    breachedAt: Date
  },
  
  evidencePhotos: [{
    url: String,
    publicId: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    photoType: { type: String, enum: ['complaint', 'resolution', 'verification'] }
  }],
  
  timeline: [{
    action: { 
      type: String,
      enum: ['submitted', 'assigned', 'accepted', 'forwarded', 'in_progress', 
             'resolved', 'rejected', 'escalated', 'reopened', 'verified', 'closed', 'commented']
    },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fromAuthority: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toAuthority: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: String,
    isVisibleToCitizen: { type: Boolean, default: true }
  }],
  
  citizenVerification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    rating: { type: Number, min: 1, max: 5 },
    feedback: String
  },
  
  isAnonymous: { type: Boolean, default: false },
  supportCount: { type: Number, default: 0 },
  supporters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

complaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

complaintSchema.index({ status: 1, category: 1, currentAuthority: 1, createdAt: -1 });
complaintSchema.index({ 'location.division': 1, 'location.ward': 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
