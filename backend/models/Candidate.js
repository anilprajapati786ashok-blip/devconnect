const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  userId: String,
  role: String,
  company: String,

  skills: { type: [String], default: [] },

  avgScore: Number,
  bestScore: Number,
  totalInterviews: Number,

  level: String,

  updatedAt: Date,
});

module.exports = mongoose.model("Candidate", candidateSchema);