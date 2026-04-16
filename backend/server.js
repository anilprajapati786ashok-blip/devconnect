require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const resumeRoutes = require('./routes/resume');
const analyzeRoutes = require('./routes/analyze');
const jobMatchRoutes = require('./routes/jobMatch');
const resumeFixerRoutes = require('./routes/resumeFixer');
const interviewRoutes = require('./routes/interview');
const mockInterviewRoutes = require('./routes/mockInterview');

const app = express();

// ===== CORS =====
app.use(cors());

// ===== Middleware =====
app.use(express.json());

// ===== Static folder =====
app.use('/uploads', express.static('uploads'));

// ===== Test Route =====
app.get('/api/test', (req, res) => {
  res.json({ message: "API working" });
});

// ===== API Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/analyze-resume', analyzeRoutes);
app.use('/api/job-match', jobMatchRoutes);
app.use('/api/resume-fixer', resumeFixerRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/mock-interview', mockInterviewRoutes);

// ===== DB Connection =====
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_LOCAL);
    console.log('MongoDB Atlas connected');
  } catch (err) {
    console.log('Atlas failed, trying local...');
    try {
      await mongoose.connect(process.env.MONGO_URI_LOCAL);
      console.log('Local MongoDB connected');
    } catch (err2) {
      console.error('MongoDB connection failed', err2);
    }
  }
};

connectDB();

// ===== Start Server =====
app.listen(5000, () => {
  console.log('Server running on port 5000');
});