const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ===== MOCK INTERVIEW CHAT =====
router.post('/', async (req, res) => {
  try {
    const { resumeText, messages } = req.body;

    if (!resumeText) {
      return res.status(400).json({ message: "Resume required " });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are a strict technical interviewer.

Rules:
- Ask one question at a time
- Based on candidate resume
- After user answers, give short feedback
- Then ask next question
- Keep conversation realistic

Do NOT return JSON.
Respond like real interviewer.
          `
        },
        {
          role: "user",
          content: `Resume:\n${resumeText}`
        },
        ...(messages || [])
      ],
      temperature: 0.5,
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });

  } catch (err) {
    console.log("Mock interview error 👉", err.message);
    res.status(500).json({ message: "AI failed " });
  }
});

module.exports = router;