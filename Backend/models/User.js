const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['citizen', 'authority', 'admin'], default: 'citizen' },
  phone: { type: String, default: '' },

  // Admin approval for authority accounts
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // citizens and admins are auto-approved
  },

  authorityInfo: {
    designation: String,
    department: String,
    division: String,
    zone: String,
    ward: String,
    jurisdictionArea: String,
    level: {
      type: String,
      enum: ['field_officer', 'junior', 'senior', 'head', 'commissioner'],
      default: 'junior'
    },
    categories: [String],
    officePhone: String,
    officialEmail: String
  },

  stats: {
    totalHandled:        { type: Number, default: 0 },
    resolvedOnTime:      { type: Number, default: 0 },
    falseClosuresCaught: { type: Number, default: 0 },
    totalRating:         { type: Number, default: 0 },
    ratingCount:         { type: Number, default: 0 }
  },

  isActive:  { type: Boolean, default: true },
  createdAt: { type: Date,    default: Date.now }
});

userSchema.virtual('averageRating').get(function () {
  if (this.stats.ratingCount === 0) return 0;
  return (this.stats.totalRating / this.stats.ratingCount).toFixed(1);
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ email: 1, role: 1 });

module.exports = mongoose.model('User', userSchema);