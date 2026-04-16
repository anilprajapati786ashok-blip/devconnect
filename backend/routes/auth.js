const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log("AUTH ROUTES LOADED ✅");

// ===== Signup =====
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists ❌" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // ✅ create token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      message: "User registered successfully ✅",
      user: newUser,
      token
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ===== Login =====
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found ❌" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password ❌" });

    // ✅ create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful ✅",
      user,
      token
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;