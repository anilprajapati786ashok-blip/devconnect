const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  bio: { type: String, default: '' },
  projects: [
    {
      title: String,
      description: String,
      link: String
    }
  ],
  images: [String], // file paths or URLs
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);