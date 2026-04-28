const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const Interview = require("../models/Interview");
const Profile = require("../models/Profile");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ================= MEMORY =================
let sessions = {};

// ================= DEFAULT SKILLS =================
const defaultSkills = {
  javascript: 50,
  dsa: 50,
  systemdesign: 50,
  backend: 50,
  frontend: 50,
};

// ================= START =================
router.post("/start", async (req, res) => {
  try {
    const { userId, role, language, company = "Google" } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const skills = { ...defaultSkills };

    const question = await generateQuestion({
      role,
      language,
      company,
      skills,
      weakArea: null,
    });

    sessions[userId] = {
      role,
      language,
      company,
      skills,
      currentQuestion: question,
    };

    res.json({ question, skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ANSWER =================
router.post("/answer", async (req, res) => {
  try {
    const { userId, answer } = req.body;

    const session = sessions[userId];

    if (!session) {
      return res.status(400).json({ error: "Start interview first" });
    }

    const question = session.currentQuestion;

    // ================= AI EVALUATION =================
    const evalRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a FAANG-level technical interviewer. 
You MUST respond with ONLY a valid JSON object — no explanation, no markdown, no extra text.
The JSON must start with { and end with }.`,
        },
        {
          role: "user",
          content: `Evaluate this interview answer strictly and fairly.

Return ONLY this JSON format:
{
  "score": <number 0-100>,
  "topic": "<javascript|dsa|backend|frontend|systemdesign>",
  "communication": <number 0-100>,
  "technical": <number 0-100>,
  "confidence": <number 0-100>,
  "emotion": <number 0-100>,
  "strengths": "<specific strength of this answer>",
  "weaknesses": "<specific weakness of this answer>",
  "improvement": "<exact steps to improve>",
  "idealAnswer": "<best possible answer in simple words>"
}

Question: ${question}
Answer: ${answer}`,
        },
      ],
    });

    // ================= BETTER PARSE =================
    let parsed = null;
    let raw = evalRes.choices[0].message.content.trim();

    console.log("🤖 AI RAW RESPONSE:", raw);

    try {
      parsed = JSON.parse(raw);
    } catch {
      try {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        }
      } catch {
        parsed = null;
      }
    }

    console.log("✅ PARSED:", parsed);

    // ================= FALLBACK =================
    if (!parsed || typeof parsed.score !== "number") {
      console.log("⚠️ Using fallback values");
      parsed = {
        score: 50,
        topic: "javascript",
        communication: 50,
        technical: 50,
        confidence: 50,
        emotion: 50,
        strengths: "Basic attempt made",
        weaknesses: "Answer needs more depth and clarity",
        improvement: "Study core concepts and practice explaining them",
        idealAnswer: "Explain concept with definition + example + use case",
      };
    }

    const topic = parsed.topic || "javascript";

    // ================= SKILL UPDATE =================
    if (!session.skills[topic]) session.skills[topic] = 50;

    if (parsed.score > 70) session.skills[topic] += 3;
    else if (parsed.score < 40) session.skills[topic] -= 5;

    session.skills[topic] = Math.max(0, Math.min(100, session.skills[topic]));

    // ================= SAVE INTERVIEW =================
    await Interview.findOneAndUpdate(
      { userId },
      {
        userId,
        skills: session.skills,
        $push: {
          questions: question,
          answers: answer,
          scores: parsed.score,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    // ================= PROFILE UPDATE =================
    let profile = await Profile.findOne({ userId });

    if (!profile) {
      profile = await Profile.create({
        userId,
        skills: session.skills,
        totalInterviews: 0,
        avgScore: 0,
        bestScore: 0,
        history: [],
      });
    }

    // ✅ FIXED avgScore calculation
    const oldCount = profile.totalInterviews;
    const newAvg = Math.round(
      (profile.avgScore * oldCount + parsed.score) / (oldCount + 1)
    );

    profile.totalInterviews = oldCount + 1;
    profile.avgScore = newAvg;
    profile.bestScore = Math.max(profile.bestScore, parsed.score);

    profile.history.push({
      score: parsed.score,
      date: new Date(),
    });

    profile.skills = session.skills;

    if (profile.avgScore > 80) profile.level = "advanced";
    else if (profile.avgScore > 60) profile.level = "intermediate";
    else profile.level = "beginner";

    await profile.save();

    // ================= NEXT QUESTION =================
    const weakest = Object.keys(session.skills).reduce((a, b) =>
      session.skills[a] < session.skills[b] ? a : b
    );

    const nextQuestion = await generateQuestion({
      role: session.role,
      language: session.language,
      company: session.company,
      skills: session.skills,
      weakArea: weakest,
    });

    session.currentQuestion = nextQuestion;

    // ================= RESPONSE =================
    res.json({
      score: parsed.score,
      nextQuestion,
      skills: session.skills,
      weakArea: weakest,
      feedback: {
        communication: parsed.communication,
        technical: parsed.technical,
        confidence: parsed.confidence,
        emotion: parsed.emotion,
        strengths: parsed.strengths,
        weaknesses: parsed.weaknesses,
        improvement: parsed.improvement,
        idealAnswer: parsed.idealAnswer,
      },
    });

  } catch (err) {
    console.error("❌ Answer route error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= REPORT =================
router.post("/report", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "No profile found" });
    }

    res.json({
      userId: profile.userId,
      totalInterviews: profile.totalInterviews,
      avgScore: profile.avgScore,
      bestScore: profile.bestScore,
      level: profile.level,
      skills: profile.skills,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= RESET =================
router.delete("/reset", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    await Profile.deleteOne({ userId });
    await Interview.deleteOne({ userId });

    res.json({ success: true, message: "Data reset ho gaya ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DEBUG =================
router.get("/debug", async (req, res) => {
  const interviews = await Interview.find();
  let result = [];
  interviews.forEach((doc) => {
    doc.scores.forEach((score) => {
      result.push({ userId: doc.userId, score });
    });
  });
  res.json(result);
});

// ================= QUESTION =================
async function generateQuestion({ role, language, company, skills, weakArea }) {
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `You are ${company} interviewer.
Ask ONE technical interview question only — no explanation, just the question.
Focus on weak area: ${weakArea || "general"}
Role: ${role}
Language: ${language}`,
      },
    ],
  });

  return res.choices[0].message.content.trim();
}

module.exports = router;