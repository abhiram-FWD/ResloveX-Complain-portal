const Category = require('../models/Category');

const seedCategories = async () => {
  const categories = [
    {
      name: 'Road Maintenance',
      slaInDays: 7,
      defaultDepartment: 'Public Works Department',
      escalationHierarchy: [
        { level: 1, designation: 'Junior Engineer' },
        { level: 2, designation: 'Senior Engineer' },
        { level: 3, designation: 'Chief Engineer' }
      ]
    },
    {
      name: 'Street Lights',
      slaInDays: 3,
      defaultDepartment: 'Electricity Department',
      escalationHierarchy: [] // Add if specific hierarchy exists, else empty
    },
    {
      name: 'Water Supply',
      slaInDays: 2,
      defaultDepartment: 'Water Board',
      escalationHierarchy: []
    },
    {
      name: 'Garbage Collection',
      slaInDays: 1,
      defaultDepartment: 'Municipal Corporation',
      escalationHierarchy: []
    },
    {
      name: 'Drainage',
      slaInDays: 5,
      defaultDepartment: 'Public Works Department',
      escalationHierarchy: []
    },
    {
      name: 'Electricity',
      slaInDays: 2,
      defaultDepartment: 'Electricity Department',
      escalationHierarchy: []
    }
  ];

  try {
    for (const category of categories) {
      await Category.findOneAndUpdate(
        { name: category.name },
        category,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log('Categories seeded successfully');
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

module.exports = seedCategories;
