const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic fields
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  },
  role: { 
    type: String, 
    enum: ['citizen', 'authority', 'admin'], 
    default: 'citizen' 
  },
  phone: { 
    type: String, 
    default: '' 
  },

  // Only filled for role: authority
  authorityInfo: {
    designation: String,
    // Examples: Junior Engineer, Senior Engineer, 
    //           Department Head, Commissioner
    
    department: String,
    // Examples: Public Works Department, Water Board,
    //           Electricity Department, Municipal Corporation, Police
    
    division: String,   // Example: Division 2
    zone: String,       // Example: Zone B  
    ward: String,       // Example: Ward 5-10
    jurisdictionArea: String, // Example: Station Road to MG Road
    
    level: { 
      type: String, 
      enum: ['field_officer', 'junior', 'senior', 'head', 'commissioner'],
      default: 'junior'
    },
    
    categories: [String],
    // Categories this officer handles
    // Example: ['Road Maintenance', 'Street Lights']
    
    officePhone: String,
    officialEmail: String
  },

  // Performance stats — auto updated by system
  stats: {
    totalHandled:        { type: Number, default: 0 },
    resolvedOnTime:      { type: Number, default: 0 },
    falseClosuresCaught: { type: Number, default: 0 },
    totalRating:         { type: Number, default: 0 },
    ratingCount:         { type: Number, default: 0 }
  },

  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Virtual: computed average rating
userSchema.virtual('averageRating').get(function() {
  if (this.stats.ratingCount === 0) return 0;
  return (this.stats.totalRating / this.stats.ratingCount).toFixed(1);
});

// Pre-save hook: hash password with bcryptjs salt 10
// Only hash if password is modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: comparePassword
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add index on email and role for query performance
userSchema.index({ email: 1, role: 1 });

module.exports = mongoose.model('User', userSchema);
