const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');

console.log("PORTFOLIO ROUTES LOADED ");

// ===== Create / Save Portfolio =====
router.post('/create', async (req, res) => {
  try {
    const { userId, name, bio, projects, images } = req.body;

    //  Important: Make sure userId is ObjectId
    const newPortfolio = new Portfolio({
      userId,
      name,
      bio,
      projects,
      images: images || []
    });

    await newPortfolio.save();
    res.json({ message: "Portfolio saved successfully ", portfolio: newPortfolio });
  } catch (err) {
    console.log("Portfolio save error 👉", err);
    res.status(500).json({ message: "Failed to save portfolio " });
  }
});

// ===== Get Portfolio by User =====
router.get('/:userId', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.params.userId });
    if (!portfolio) return res.status(404).json({ message: "Portfolio not found " });

    res.json(portfolio);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error " });
  }
});

module.exports = router;