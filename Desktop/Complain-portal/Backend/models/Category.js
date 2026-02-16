const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  slaInDays: { 
    type: Number, 
    required: true 
  },
  defaultDepartment: { 
    type: String, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  escalationHierarchy: [{
    level: Number,
    designation: String
  }]
});

module.exports = mongoose.model('Category', categorySchema);
