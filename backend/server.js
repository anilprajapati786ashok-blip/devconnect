require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");

const app = express();

// ================= CONNECT DB =================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_LOCAL);
    console.log("✅ MongoDB Connected Successfully 🚀");
  } catch (err) {
    console.log("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

connectDB();

// ================= MIDDLEWARE =================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

// ================= REQUEST LOGGER =================
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.url}`);
  next();
});

// ================= HEALTH CHECK =================
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Server Running 🚀",
    time: new Date().toISOString(),
  });
});

// ================= 🔥 MAIN ROUTES =================

// ✅ INTERVIEW (AI ENGINE)
if (fs.existsSync("./routes/interview.js")) {
  app.use("/api/interview", require("./routes/interview"));
  console.log("✅ Interview routes loaded");
} else {
  console.log("⚠️ Interview routes file missing");
}

// ✅ ADMIN PANEL (TEACHER AI SYSTEM)
if (fs.existsSync("./routes/admin.js")) {
  app.use("/api/admin", require("./routes/admin"));
  console.log("✅ Admin routes loaded");
} else {
  console.log("⚠️ Admin routes file missing");
}

// ✅ PORTFOLIO
if (fs.existsSync("./routes/portfolio.js")) {
  app.use("/api/portfolio", require("./routes/portfolio"));
  console.log("✅ Portfolio routes loaded");
} else {
  console.log("⚠️ Portfolio routes file missing");
}

// ================= DEFAULT ROUTE =================
app.get("/", (req, res) => {
  res.send("🚀 DevConnect AI (Admin Mode) Running");
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found ❌",
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal Server Error ❌",
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});