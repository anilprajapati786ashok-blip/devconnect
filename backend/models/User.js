const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // 🔐 role system (user/admin)
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  // 📊 tracking
  createdAt: {
    type: Date,
    default: Date.now,
  },

  lastLogin: {
    type: Date,
    default: null,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("User", userSchema);