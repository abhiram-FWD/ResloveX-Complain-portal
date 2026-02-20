const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Seed categories
    const Category = require('../models/Category');
    const categories = [
      { name: 'Road Maintenance', slaInDays: 7, defaultDepartment: 'Public Works Department' },
      { name: 'Street Lights', slaInDays: 3, defaultDepartment: 'Electricity Department' },
      { name: 'Water Supply', slaInDays: 2, defaultDepartment: 'Water Board' },
      { name: 'Garbage Collection', slaInDays: 1, defaultDepartment: 'Municipal Corporation' },
      { name: 'Drainage', slaInDays: 5, defaultDepartment: 'Public Works Department' },
      { name: 'Electricity', slaInDays: 2, defaultDepartment: 'Electricity Department' },
      { name: 'Other', slaInDays: 7, defaultDepartment: 'Municipal Corporation' }
    ];
    
    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { name: cat.name },
        cat,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Categories seeded');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
