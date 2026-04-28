import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/next-question", async (req, res) => {
  try {
    const { resumeText, chat } = req.body;

    const prompt = `
You are a FAANG-level technical interviewer.

Resume:
${resumeText}

Chat history:
${JSON.stringify(chat)}

Ask ONLY ONE smart next interview question.
Do NOT repeat questions.
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: "You are an interviewer." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      question: response.data.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;