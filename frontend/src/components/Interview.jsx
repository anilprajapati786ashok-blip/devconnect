import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function Interview() {
  // ================= STATES =================
  const [resume, setResume] = useState(null);
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState("");

  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("");

  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔥 NEW ADD (CODE PANEL)
  const [code, setCode] = useState("function solve(){ return true }");
  const [codeResult, setCodeResult] = useState(null);

  const chatRef = useRef(null);

  const API = "https://devconnect-8fpj.onrender.com";

  const hasResume = () => Boolean(resume && resume.text);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // ================= SCORE ENGINE =================
  const evaluate = (text) => {
    let s = 50;

    if (text?.toLowerCase().includes("react")) s += 10;
    if (text?.toLowerCase().includes("api")) s += 10;
    if (text?.length > 100) s += 10;

    return Math.min(100, s);
  };

  const decision = (s) =>
    s >= 80 ? "🟢 Hired" : s >= 60 ? "🟡 Maybe" : "🔴 Rejected";

  // ================= SPEECH (AI SPEAKS) =================
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  // ================= SPEECH TO TEXT =================
  const startListening = () => {
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) return alert("Speech not supported");

    const rec = new SR();
    rec.lang = "en-US";

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);

    rec.onresult = (e) => {
      setMsg(e.results[0][0].transcript);
    };

    rec.start();
  };

  // ================= START INTERVIEW =================
  const startInterview = async () => {
    setResume({
      text: "Full stack React Node developer with AI integration skills",
    });

    await getNextQuestion([]);
  };

  // ================= REAL AI QUESTION =================
  const getNextQuestion = async (updatedChat) => {
    try {
      setLoading(true);

      const res = await axios.post(`${API}/api/next-question`, {
        resumeText: resume?.text || "",
        chat: updatedChat,
      });

      const question = res.data.question;

      const newChat = [
        ...updatedChat,
        { role: "assistant", content: question },
      ];

      setChat(newChat);

      speak(question);
    } catch (err) {
      alert("AI failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= SEND ANSWER =================
  const sendMessage = async () => {
    if (!msg) return;

    const newChat = [...chat, { role: "user", content: msg }];

    setChat(newChat);

    const s = evaluate(msg);
    setScore((p) => Math.round((p + s) / 2));
    setStatus(decision(score));

    setMsg("");

    await getNextQuestion(newChat);
  };

  // 🔥 ================= CODE SUBMIT =================
  const runCode = async () => {
    try {
      const res = await axios.post(`${API}/api/dsa/submit`, {
        userId: "user123",
        problemId: "demo", // 🔥 later dynamic karenge
        code,
      });

      setCodeResult(res.data);
    } catch (err) {
      alert("❌ Code execution failed");
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl font-bold text-center">
        🚀 AI Interview System (REAL)
      </h1>

      {/* START BUTTON */}
      <div className="text-center mt-4">
        <button
          onClick={startInterview}
          className="bg-green-500 px-4 py-2 rounded"
        >
          Start Interview
        </button>
      </div>

      {/* SCORE */}
      <div className="text-center mt-4">
        <p className="text-lg">Score: {score}</p>
        <p className="font-bold">{status}</p>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex gap-4 mt-5">

        {/* CHAT SIDE */}
        <div className="w-2/3">

          <div className="bg-white/10 p-4 rounded h-80 overflow-y-auto">
            {chat.map((c, i) => (
              <p key={i} className="mb-2">
                <b>{c.role}:</b> {c.content}
              </p>
            ))}
            <div ref={chatRef} />
          </div>

          {/* INPUT */}
          <div className="flex gap-2 mt-4">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="flex-1 p-2 text-black rounded"
            />

            <button
              onClick={startListening}
              className="bg-yellow-500 px-3 rounded"
            >
              🎤
            </button>

            <button
              onClick={sendMessage}
              className="bg-blue-500 px-4 rounded"
            >
              Send
            </button>
          </div>

        </div>

        {/* 🔥 CODE PANEL */}
        <div className="w-1/3 bg-gray-900 p-4 rounded">

          <h2 className="text-lg font-bold mb-2">💻 Code Panel</h2>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-60 bg-black p-3 rounded text-sm font-mono"
          />

          <button
            onClick={runCode}
            className="mt-3 w-full bg-green-500 py-2 rounded"
          >
            ▶ Run Code
          </button>

          {codeResult && (
            <div className="mt-3 text-sm">
              <p>Passed: {codeResult.passed}</p>
              <p>Score: {codeResult.score}%</p>
            </div>
          )}

        </div>

      </div>

      {listening && (
        <p className="text-center mt-2">🎤 Listening...</p>
      )}

      {loading && (
        <p className="text-center mt-2">🤖 AI thinking...</p>
      )}

    </div>
  );
}

export default Interview;