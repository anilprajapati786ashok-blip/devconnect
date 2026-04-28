const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema(
  {
    userId: String,

    questions: [String],
    answers: [String],
    scores: [Number],

    skills: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", InterviewSchema);