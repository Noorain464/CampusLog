const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Register a new user
exports.register = async (req, res) => {
  try {
  const { name, email, password, role } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ 
      success: false, 
      message: "Email already exists" 
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ 
    name, 
    email, 
    password: hashedPassword, 
    role: role || 'student' 
  });
  await newUser.save();

  // Generate JWT token
  const token = jwt.sign(
    { userId: newUser._id, email: newUser.email, role: newUser.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Remove password from response
  const userResponse = newUser.toObject();
  delete userResponse.password;

    res.status(201).json({ 
      success: true, 
      user: userResponse,
      token 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
  const { email, password,pushToken } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid email or password" 
    });
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid email or password" 
    });
  }

  // Update Push Token if provided
  if (pushToken) {
    user.pushToken = pushToken;
    await user.save();
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

    res.json({ 
      success: true, 
      user: userResponse,
      token 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Update Push Notification Token
exports.updatePushToken = async (req, res) => {
  try {
    const userId = req.user._id;
    const { pushToken } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.pushToken = pushToken;
    await user.save();

    res.json({ success: true, message: 'Push token updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ 
      success: true, 
      user 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
