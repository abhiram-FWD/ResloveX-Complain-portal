const mongoose = require('mongoose');
const Category = require('../models/Category');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default categories
    await seedCategories();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed 6 default categories with SLA and escalation hierarchy
const seedCategories = async () => {
  const categories = [
    {
      name: 'Road Maintenance',
      slaInDays: 7,
      defaultDepartment: 'Public Works Department',
      escalationHierarchy: [
        { level: 1, designation: 'JE' },
        { level: 2, designation: 'SE' },
        { level: 3, designation: 'Chief Engineer' }
      ]
    },
    {
      name: 'Street Lights',
      slaInDays: 3,
      defaultDepartment: 'Electricity Department',
      escalationHierarchy: [
        { level: 1, designation: 'JE' },
        { level: 2, designation: 'SE' },
        { level: 3, designation: 'Chief Engineer' }
      ]
    },
    {
      name: 'Water Supply',
      slaInDays: 2,
      defaultDepartment: 'Water Board',
      escalationHierarchy: [
        { level: 1, designation: 'JE' },
        { level: 2, designation: 'SE' },
        { level: 3, designation: 'Chief Engineer' }
      ]
    },
    {
      name: 'Garbage Collection',
      slaInDays: 1,
      defaultDepartment: 'Municipal Corporation',
      escalationHierarchy: [
        { level: 1, designation: 'JE' },
        { level: 2, designation: 'SE' },
        { level: 3, designation: 'Chief Engineer' }
      ]
    },
    {
      name: 'Drainage',
      slaInDays: 5,
      defaultDepartment: 'Public Works Department',
      escalationHierarchy: [
        { level: 1, designation: 'JE' },
        { level: 2, designation: 'SE' },
        { level: 3, designation: 'Chief Engineer' }
      ]
    },
    {
      name: 'Electricity',
      slaInDays: 2,
      defaultDepartment: 'Electricity Department',
      escalationHierarchy: [
        { level: 1, designation: 'JE' },
        { level: 2, designation: 'SE' },
        { level: 3, designation: 'Chief Engineer' }
      ]
    }
  ];

  try {
    for (const category of categories) {
      await Category.findOneAndUpdate(
        { name: category.name },
        category,
        { upsert: true, new: true }
      );
    }
    console.log('✓ Categories seeded successfully');
  } catch (error) {
    console.error('Category seeding error:', error.message);
  }
};

module.exports = connectDB;
