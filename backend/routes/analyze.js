const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

console.log("ANALYZE ROUTES LOADED (ATS MODE) ");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
          content: "You are a strict ATS system. Return ONLY valid JSON."
        },
        {
          role: "user",
          content: `
You are a strict, highly critical ATS (Applicant Tracking System) and hiring expert.

Your job is to evaluate resumes objectively and harshly based on industry standards.

You must:
- Be unbiased and consistent
- Penalize vague, generic, or weak content
- Reward measurable impact and clarity
- Avoid being overly positive

You MUST return output in JSON format only.

Evaluation Criteria (each scored out of 100):
1. Content Quality (impact, achievements, clarity)
2. Skills Relevance (to tech/role)
3. Experience Strength
4. Structure & Formatting
5. ATS Compatibility

Instructions:
- Be strict. Do NOT inflate scores.
- Average resumes should score between 50–70.
- Only excellent resumes should exceed 80.
- Penalize missing metrics, vague claims, poor formatting.

Output format (STRICT JSON):
{
  "overall_score": number,
  "category_scores": {
    "content_quality": number,
    "skills_relevance": number,
    "experience_strength": number,
    "structure_formatting": number,
    "ats_compatibility": number
  },
  "strengths": [],
  "weaknesses": [],
  "improvements": [
    {
      "issue": "...",
      "fix": "...",
      "example": "..."
    }
  ]
}

Resume:
${resumeText}
          `
        }
      ],
      temperature: 0.4,
    });

    const aiText = completion.choices[0].message.content;

    let parsed;
    try {
      const cleanText = aiText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleanText);
    } catch (e) {
      console.log("JSON parse failed 👉", aiText);
      return res.status(500).json({ message: "AI parsing failed " });
    }

    res.json(parsed);

  } catch (err) {
    console.log("Groq error 👉", err.message);
    res.status(500).json({ message: "AI failed " });
  }
});

module.exports = router;