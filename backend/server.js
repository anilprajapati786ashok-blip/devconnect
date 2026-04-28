require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");

const app = express(); // ✅ CREATE APP FIRST

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
  });
});

// ================= AUTH ROUTES (QUICK FIX) =================
app.post("/api/auth/signup", (req, res) => {
  const { name, email } = req.body;

  console.log("Signup request:", req.body);

  res.json({
    success: true,
    user: { name, email },
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;

  console.log("Login request:", req.body);

  res.json({
    success: true,
    user: { email },
  });
});

// ================= OTHER ROUTES =================
if (fs.existsSync("./routes/interview.js")) {
  app.use("/api/interview", require("./routes/interview"));
  console.log("✅ Interview routes loaded");
}

if (fs.existsSync("./routes/admin.js")) {
  app.use("/api/admin", require("./routes/admin"));
  console.log("✅ Admin routes loaded");
}

if (fs.existsSync("./routes/portfolio.js")) {
  app.use("/api/portfolio", require("./routes/portfolio"));
  console.log("✅ Portfolio routes loaded");
}

// ================= DEFAULT ROUTE =================
app.get("/", (req, res) => {
  res.send("🚀 DevConnect AI Running");
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found ❌",
  });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});