const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post('/', async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ message: "Resume text required " });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a technical interviewer. Generate interview questions."
        },
        {
          role: "user",
          content: `
Generate 8-10 interview questions based on this resume.

Rules:
- Mix of technical + HR questions
- Focus on projects and skills
- Keep questions short
- Return ONLY JSON

Format:
{
  "questions": ["q1", "q2", "q3"]
}

Resume:
${resumeText}
          `
        }
      ],
      temperature: 0.5,
    });

    const aiText = completion.choices[0].message.content;

    let parsed;
    try {
      const clean = aiText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      console.log("Parse error 👉", aiText);
      return res.status(500).json({ message: "AI parse failed " });
    }

    res.json(parsed);

  } catch (err) {
    console.log("Interview error 👉", err.message);
    res.status(500).json({ message: "AI failed " });
  }
});

module.exports = router;