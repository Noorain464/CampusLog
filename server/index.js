// server/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./config/dbConfig');
const authRoutes = require('./routes/auth.route');
const inventoryRoutes = require('./routes/inventory.route');
const transactionRoutes = require('./routes/transaction.route');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please create a .env file with the required variables.');
  process.exit(1);
}

// Connect to database
connectDB();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Allow specific origin in production
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'CampusLog Backend is Alive!',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', authRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', transactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});