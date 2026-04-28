const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

// ================= GET ALL USERS =================
router.get("/users", async (req, res) => {
  try {
    const users = await Profile.find().sort({ avgScore: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SINGLE USER ANALYSIS (POST) =================
router.post("/analysis", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || userId === "undefined") {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const user = await Profile.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ===== WEAK AREA =====
    let weakArea = "javascript";

    if (user.skills && typeof user.skills === "object") {
      weakArea = Object.keys(user.skills).reduce((a, b) =>
        user.skills[a] < user.skills[b] ? a : b
      );
    }

    // ===== ROADMAP =====
    const roadmapMap = {
      javascript: ["Variables", "Functions", "Closures", "Async/Await"],
      frontend: ["HTML/CSS", "React", "State Management", "Projects"],
      backend: ["Node.js", "APIs", "Database", "Auth"],
      dsa: ["Arrays", "Recursion", "Sorting", "Graphs"],
      systemdesign: ["Scalability", "Caching", "Microservices"],
    };

    const roadmap = roadmapMap[weakArea] || roadmapMap.javascript;

    const explanation = `Focus on improving ${weakArea}. Practice daily and build small projects.`;

    const steps = [
      "Practice 30 min daily",
      "Solve coding problems",
      "Build projects",
      "Revise weak topics",
    ];

    res.json({
      userId: user.userId,
      level: user.level,
      avgScore: user.avgScore,
      bestScore: user.bestScore,
      totalInterviews: user.totalInterviews,
      weakArea,
      roadmap,
      explanation,
      steps,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;