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
          content: "You are an expert resume writer. Improve resumes professionally."
        },
        {
          role: "user",
          content: `
Improve the following resume.

Rules:
- Make bullet points strong and impactful
- Add metrics if possible
- Use professional language
- Keep it concise
- Return ONLY improved resume text (no explanation)

Resume:
${resumeText}
          `
        }
      ],
      temperature: 0.5,
    });

    const improvedText = completion.choices[0].message.content;

    res.json({ improvedResume: improvedText });

  } catch (err) {
    console.log("Resume fixer error 👉", err.message);
    res.status(500).json({ message: "AI failed " });
  }
});

module.exports = router;