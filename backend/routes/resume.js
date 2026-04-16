const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require("mammoth"); //  DOCX support

console.log("RESUME ROUTES LOADED ");

// ===== Storage setup =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/resumes';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ===== Upload Resume =====
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded " });

    let resumeText = "";
    const ext = path.extname(req.file.originalname).toLowerCase();

    // ===== PDF =====
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text || "";

    // ===== TXT =====
    } else if (ext === ".txt") {
      resumeText = fs.readFileSync(req.file.path, "utf-8");

    // ===== DOCX =====
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: req.file.path });
      resumeText = result.value || "";

    // ===== OTHER (future OCR) =====
    } else {
      resumeText = "";
    }

    const resumeData = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      text: resumeText
    };

    res.json({ message: "Resume uploaded successfully ", resume: resumeData });

  } catch (err) {
    console.log("Resume upload error 👉", err);
    res.status(500).json({ message: "Server error " });
  }
});

module.exports = router;