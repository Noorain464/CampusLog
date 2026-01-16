// server/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Inventory = require('./models/inventory.model');
const User = require('./models/user.model');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campuslog';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('🌱 Seeding Data...');

    // 1. Clear old data
    await Inventory.deleteMany({});
    await User.deleteMany({});

    // 2. Create Dummy Items
    await Inventory.insertMany([
      { name: "Cricket Bat (SG)", category: "Sports", totalQuantity: 5, availableQuantity: 5 },
      { name: "Football (Nike)", category: "Sports", totalQuantity: 3, availableQuantity: 3 },
      { name: "Arduino Uno Kit", category: "Electronics", totalQuantity: 10, availableQuantity: 10 },
      { name: "Digital Multimeter", category: "Electronics", totalQuantity: 6, availableQuantity: 6 },
      { name: "Physics Lab Key", category: "Keys", totalQuantity: 1, availableQuantity: 1 },
    ]);

    // 3. Create Dummy Admin with hashed password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin', saltRounds);
    
    await User.create({
      name: "Sports Teacher",
      email: "admin@college.com",
      password: hashedPassword,
      role: "admin"
    });

    // 4. Create a sample student
    const studentPassword = await bcrypt.hash('student123', saltRounds);
    await User.create({
      name: "John Doe",
      email: "student@college.com",
      password: studentPassword,
      role: "student"
    });

    console.log('✅ Data Seeded!');
    console.log('📦 Items created');
    console.log('👤 Admin created: admin@college.com / admin');
    console.log('👤 Student created: student@college.com / student123');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  });