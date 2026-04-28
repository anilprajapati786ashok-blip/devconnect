const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const Interview = require("../models/Interview");


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ================= SAFE SESSION STORE =================
const sessions = {};

// ================= UTILITY =================
const safeJSONParse = (text) => {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    return null;
  }
};

// ================= 🔥 NEW: COMPANY STYLE ENGINE =================
const getCompanyStyle = (company) => {
  if (company === "Google") {
    return `
Focus on:
- DSA (Graphs, Trees, DP)
- Optimization
- Deep thinking
`;
  }

  if (company === "Amazon") {
    return `
Focus on:
- Real-world problems
- System design basics
- Behavioral questions (Leadership Principles)
`;
  }

  if (company === "Microsoft") {
    return `
Focus on:
- Practical coding
- Medium DSA
- Clean explanation
`;
  }

  return "General interview questions";
};

// ================= START =================
router.post("/start", async (req, res) => {
  try {
    const { userId, role, language, company = "General" } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId missing" });
    }

    sessions[userId] = {
      difficulty: "easy",
      asked: [],
      company,
      skills: {
        javascript: 50,
        core: 50,
        problemSolving: 50,
      },
    };

    const style = getCompanyStyle(company);

    const ai = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
You are an interviewer from ${company}.

${style}

Ask ONE beginner level ${role} (${language}) question.
Return ONLY question.
          `,
        },
      ],
    });

    const q = ai.choices?.[0]?.message?.content?.trim();

    if (!q) {
      return res.status(500).json({ error: "AI did not return question" });
    }

    sessions[userId].asked.push(q);

    await Interview.create({
      userId,
      role,
      language,
      questions: [q],
      answers: [],
      score: 0,
      skills: sessions[userId].skills,
      createdAt: new Date(),
    });

    res.json({ question: q, difficulty: "easy" });
  } catch (err) {
    console.error("START ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ================= ANSWER =================
router.post("/answer", async (req, res) => {
  try {
    const { userId, answer } = req.body;

    if (!userId || !answer) {
      return res.status(400).json({ error: "userId or answer missing" });
    }

    const session = sessions[userId];
    if (!session) {
      return res.status(400).json({ error: "Session not found. Call /start first." });
    }

    const lastQ = session.asked.at(-1);
    if (!lastQ) {
      return res.status(400).json({ error: "No question found in session" });
    }

    const topicRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Extract 1-2 word topic: ${lastQ}`,
        },
      ],
    });

    const topic =
      topicRes.choices?.[0]?.message?.content?.trim().toLowerCase() ||
      "javascript";

    const evalRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
Evaluate answer strictly but fairly:

Question: ${lastQ}
Answer: ${answer}

Return ONLY valid JSON:
{
  "score": 0,
  "verdict": "correct | partial | wrong | unrelated",
  "communication": "clarity",
  "technical": "accuracy explanation",
  "confidence": "low/medium/high",
  "emotion": "confident/unsure/weak",
  "strengths": "what is correct",
  "weaknesses": "what is missing",
  "improvements": "how to improve",
  "idealAnswer": "best answer",
  "weak": "${topic}"
}
          `,
        },
      ],
    });

    const raw = evalRes.choices?.[0]?.message?.content || "";

    let parsed = safeJSONParse(raw);

    if (!parsed) {
      parsed = {
        score: 0,
        verdict: "wrong",
        communication: "parse error",
        technical: "AI format issue",
        confidence: "low",
        emotion: "neutral",
        strengths: "none",
        weaknesses: "error",
        improvements: "fix AI output",
        idealAnswer: "",
        weak: topic,
      };
    }

    const skill = parsed.weak || "javascript";

    if (!session.skills[skill]) session.skills[skill] = 50;

    if (parsed.score >= 70) session.skills[skill] += 5;
    else if (parsed.score < 40) session.skills[skill] -= 5;

    session.skills[skill] = Math.max(
      0,
      Math.min(100, session.skills[skill])
    );

    const style = getCompanyStyle(session.company);

    const nextRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
You are an interviewer from ${session.company}.

${style}

Candidate Skills:
${JSON.stringify(session.skills)}

DO NOT repeat:
${session.asked.join("\n")}

Ask ONLY ONE NEW QUESTION.
          `,
        },
      ],
    });

    const nextQ =
      nextRes.choices?.[0]?.message?.content?.trim() ||
      "Explain your previous answer in detail.";

    if (!session.asked.includes(nextQ)) {
      session.asked.push(nextQ);
    }

    session.difficulty =
      parsed.score >= 70
        ? "medium"
        : parsed.score < 40
        ? "easy"
        : "medium";

    await Interview.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          score: parsed.score,
          skills: session.skills,
          updatedAt: new Date(),
        },
        $push: {
          questions: lastQ,
          answers: answer,
        },
        $setOnInsert: {
          role: "unknown",
          language: "unknown",
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      nextQuestion: nextQ,
      nextDifficulty: session.difficulty,
      score: parsed.score,
      feedback: parsed,
      skills: session.skills,
    });
  } catch (err) {
    console.error("ANSWER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= REPORT =================
router.post("/report", (req, res) => {
  try {
    const { userId } = req.body;

    const session = sessions[userId];
    if (!session) {
      return res.status(400).json({ error: "No session found" });
    }

    const skills = session.skills;

    const avg =
      Object.values(skills).reduce((a, b) => a + b, 0) /
      Object.keys(skills).length;

    const weak = [];
    const strong = [];

    for (let k in skills) {
      skills[k] < 50 ? weak.push(k) : strong.push(k);
    }

    res.json({
      totalScore: Math.round(avg),
      strongSkills: strong,
      weakSkills: weak,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DEBUG =================
router.get("/debug", async (req, res) => {
  try {
    const data = await Interview.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;