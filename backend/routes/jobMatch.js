const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post('/', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: "Missing data " });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an intelligent ATS job matcher. Return ONLY JSON."
        },
        {
          role: "user",
          content: `
Compare the resume with job description using semantic understanding.

Return JSON:
{
  "matchScore": number,
  "matchedSkills": [],
  "missingSkills": [],
  "summary": "short explanation"
}

Be realistic and strict.

Resume:
${resumeText}

Job Description:
${jobDescription}
          `
        }
      ],
      temperature: 0.3,
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
    console.log("AI match error 👉", err.message);
    res.status(500).json({ message: "AI failed " });
  }
});

module.exports = router;