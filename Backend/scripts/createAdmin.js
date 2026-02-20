require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const existing = await User.findOne({ email: 'admin@gmail.com' });
    if (existing) {
      console.log('Admin account already exists!');
      process.exit();
    }

    await User.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'Admin@1234',  // change this to your preferred password
      role: 'admin',
      approvalStatus: 'approved',
      isActive: true,
      phone: '',
      stats: {
        totalHandled: 0,
        resolvedOnTime: 0,
        falseClosuresCaught: 0,
        totalRating: 0,
        ratingCount: 0
      }
    });

    console.log('✅ Admin account created successfully!');
    console.log('Email: admin@gmail.com');
    console.log('Password: Admin@1234');
    console.log('Secret Key: RESOLVEX@ADMIN2026');
    console.log('⚠️  Delete this script after running it!');
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();