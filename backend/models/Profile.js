const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    userId: String,

    avgScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    totalInterviews: { type: Number, default: 0 },

    level: { type: String, default: "beginner" },

    // ✅ IMPORTANT FIX
    skills: {
      javascript: { type: Number, default: 50 },
      dsa: { type: Number, default: 50 },
      systemdesign: { type: Number, default: 50 },
      backend: { type: Number, default: 50 },
      frontend: { type: Number, default: 50 },
    },

    history: [
      {
        score: Number,
        date: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);