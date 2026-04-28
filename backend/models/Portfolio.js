const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema(
  {
    userId: { type: String },
    name: { type: String },
    bio: { type: String },
    projects: [
      {
        title: String,
        description: String,
        link: String,
      },
    ],
    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Portfolio", PortfolioSchema);