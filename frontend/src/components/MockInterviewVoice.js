import React, { useState, useEffect } from "react";
import axios from "axios";

function MockInterviewVoice() {
  const [mode, setMode] = useState("dashboard");
  const [role, setRole] = useState("frontend");
  const [language, setLanguage] = useState("javascript");
  const [company, setCompany] = useState("Google");
  const [timerMin, setTimerMin] = useState(10);
  const [questionLimit, setQuestionLimit] = useState(5);
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(1);
  const [listening, setListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isCoding, setIsCoding] = useState(false);
  const [code, setCode] = useState("function solve(){\n  return true;\n}");

  // ✅ Search states
  const [roleInput, setRoleInput] = useState("frontend");
  const [companyInput, setCompanyInput] = useState("Google");

  const defaultRoles = [
    "frontend", "backend", "fullstack", "devops", "mobile App developer",
    "data science", "machine learning", "blockchain",
    "cybersecurity", "cloud Engineer", "QA engineer", "android developer", "ios developer",
    
  ];

  const defaultCompanies = [
    "Google", "Amazon", "Microsoft", "Apple", "Meta",
    "Netflix", "Uber", "Airbnb", "Twitter", "LinkedIn",
    "Flipkart", "Swiggy", "Zomato", "Paytm", "Infosys",
    "TCS", "Wipro", "HCL", "Accenture", "IBM", "oracle", "Tesla",
    "NVIDIA",
  ];

  const filteredRoles = roleInput
    ? defaultRoles.filter(r => r.toLowerCase().includes(roleInput.toLowerCase()))
    : defaultRoles;

  const filteredCompanies = companyInput
    ? defaultCompanies.filter(c => c.toLowerCase().includes(companyInput.toLowerCase()))
    : defaultCompanies;

  // ✅ real userId
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.email || "guest";

  const API = "https://devconnect-8fpj.onrender.com";
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (mode !== "interview") return;
    let timer = null;
    timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          endInterview();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mode]);

  const formatTime = (t) =>
    `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;

  const speak = (text) => {
    if (!text) return;
    setAiSpeaking(true);
    const msg = new SpeechSynthesisUtterance(text);
    msg.onend = () => setAiSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech not supported");
    const rec = new SR();
    rec.start();
    setListening(true);
    rec.onresult = (e) => {
      setAnswer(e.results[0][0].transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
  };

  const startInterview = async () => {
    try {
      const res = await axios.post(`${API}/start`, {
        userId,
        role,
        language,
        company,
        limit: questionLimit,
      });
      setQuestion(res.data.question);
      setDifficulty(res.data.difficulty || "medium");
      setScore(0);
      setFeedback(null);
      setMode("interview");
      setTimeLeft(timerMin * 60);
      setCurrentQ(1);
      setIsCoding(res.data.isCoding || false);
      speak(res.data.question);
    } catch (err) {
      alert("❌ Backend not running");
      console.log(err);
    }
  };

  const submitAnswer = async () => {
    if (!answer) return;
    try {
      const res = await axios.post(`${API}/answer`, {
        userId,
        answer,
      });
      const nextQ = currentQ + 1;
      setScore(res.data.score);
      setQuestion(res.data.nextQuestion);
      setDifficulty(res.data.nextDifficulty || "medium");
      setFeedback(res.data.feedback);
      setIsCoding(res.data.isCoding || false);
      speak(res.data.nextQuestion);
      setAnswer("");
      setCurrentQ(nextQ);
      if (nextQ > questionLimit) {
        endInterview();
      }
    } catch (err) {
      alert("❌ Error submitting");
      console.log(err);
    }
  };

  const runCode = () => {
    alert("🚀 Code submitted");
  };

  const repeatQuestion = () => speak(question);

  const endInterview = async () => {
    try {
      await axios.post("http://localhost:5000/api/interview/report", {
        userId,
      });
    } catch (err) {
      console.log("REPORT ERROR:", err.message);
    }
    setMode("dashboard");
    setQuestion("");
    setAnswer("");
    setFeedback(null);
  };

  // ================= DASHBOARD =================
  if (mode === "dashboard") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="p-8 bg-white/5 rounded-2xl w-full max-w-lg space-y-5">

          <h1 className="text-3xl font-bold text-center">
            🚀 AI Interview Setup
          </h1>

          {/* ROLE SEARCH */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              🎯 Role
            </label>
            <input
              className="w-full p-2 bg-gray-900 rounded mb-2"
              placeholder="Search role... (e.g. frontend, devops)"
              value={roleInput}
              onChange={(e) => {
                setRoleInput(e.target.value);
                setRole(e.target.value);
              }}
            />
            <div className="flex flex-wrap gap-2">
              {filteredRoles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setRoleInput(r);
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    role === r
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* LANGUAGE */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              💻 Language
            </label>
            <select
              className="w-full p-2 bg-gray-900 rounded"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>javascript</option>
              <option>python</option>
              <option>java</option>
              <option>c++</option>
              <option>typescript</option>
              <option>go</option>
              <option>rust</option>
              <option>c#</option>
              <option>PHP</option>
              <option>React.js</option>
              <option>Node.js</option>
              <option>Express.js</option>
              <option>c</option>
              <option>R</option>
              <option>Ruby</option>
              <option>Swift</option>
              <option>HTML</option>
              <option>CSS</option>
              <option>Angular.js</option>
              <option>Django</option>
              <option>Flask</option>
              <option>Spring Boot</option>
              <option>Kotlin</option>
              <option>NLP</option>
            </select>
          </div>

          {/* COMPANY SEARCH */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              🏢 Company
            </label>
            <input
              className="w-full p-2 bg-gray-900 rounded mb-2"
              placeholder="Search company... (e.g. Google, TCS)"
              value={companyInput}
              onChange={(e) => {
                setCompanyInput(e.target.value);
                setCompany(e.target.value);
              }}
            />
            <div className="flex flex-wrap gap-2">
              {filteredCompanies.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCompany(c);
                    setCompanyInput(c);
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    company === c
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* TIMER */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              ⏱ Timer (minutes)
            </label>
            <input
              type="number"
              className="w-full p-2 bg-gray-900 rounded"
              value={timerMin}
              onChange={(e) => setTimerMin(e.target.value)}
            />
          </div>

          {/* QUESTION LIMIT */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              ❓ Question Limit
            </label>
            <input
              type="number"
              className="w-full p-2 bg-gray-900 rounded"
              value={questionLimit}
              onChange={(e) => setQuestionLimit(e.target.value)}
            />
          </div>

          {/* SELECTED INFO */}
          <div className="bg-white/5 p-3 rounded-xl text-sm text-gray-300">
            ✅ Role: <span className="text-purple-400 font-bold">{role}</span> | 🏢 Company: <span className="text-cyan-400 font-bold">{company}</span>
          </div>

          <button
            onClick={startInterview}
            className="w-full p-3 bg-purple-600 rounded-xl font-bold text-lg hover:bg-purple-700"
          >
            Start Interview 🚀
          </button>

        </div>
      </div>
    );
  }

  // ================= INTERVIEW =================
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex justify-between p-4 border-b border-gray-800">
        <div>Q {currentQ}/{questionLimit} | {difficulty} | {company}</div>
        <div>⏱ {formatTime(timeLeft)}</div>
      </div>

      <div className="flex flex-1">
        <div className="w-1/4 flex flex-col items-center justify-center border-r border-gray-800">
          <div className={`w-24 h-24 bg-purple-500 rounded-full ${listening || aiSpeaking ? "animate-pulse" : ""}`} />
          <p className="mt-3">
            {listening ? "🎤 Speaking" : aiSpeaking ? "🤖 AI" : "Idle"}
          </p>
        </div>

        <div className="w-2/4 p-6">
          <div className="p-4 bg-gray-900 rounded-xl text-lg">
            {question}
          </div>

          <button
            onClick={repeatQuestion}
            className="mt-3 bg-yellow-400 text-black px-3 py-1 rounded"
          >
            🔊 Repeat
          </button>

          <textarea
            className="w-full mt-4 p-3 bg-gray-900 rounded"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
          />

          <div className="flex gap-3 mt-3">
            <button
              onClick={startListening}
              className="bg-purple-600 px-4 py-2 rounded"
            >
              🎤 Speak
            </button>
            <button
              onClick={submitAnswer}
              className="bg-green-600 px-4 py-2 rounded"
            >
              Submit
            </button>
          </div>

          {feedback && (
            <div className="mt-4 bg-white/5 p-4 rounded-xl text-sm space-y-2">
              <p>🗣 Communication: {feedback.communication}</p>
              <p>🧠 Technical: {feedback.technical}</p>
              <p>😎 Confidence: {feedback.confidence}</p>
              <p>🎤 Emotion: {feedback.emotion}</p>
              <p>💪 Strengths: {feedback.strengths}</p>
              <p>⚠ Weaknesses: {feedback.weaknesses}</p>
              <p>📈 Improve: {feedback.improvement}</p>
              <p>💡 Ideal Answer: {feedback.idealAnswer}</p>
            </div>
          )}

          <div className="mt-3 text-green-400 font-bold">
            Score: {score}
          </div>
        </div>

        {/* CODE PANEL */}
        <div className="w-1/4 border-l border-gray-800 p-4">
          <div className="font-bold">💻 Code Panel</div>
          {isCoding ? (
            <>
              <textarea
                className="w-full h-60 mt-3 bg-black p-3 rounded text-xs font-mono"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                onClick={runCode}
                className="mt-2 bg-green-500 px-3 py-1 rounded text-black"
              >
                ▶ Run Code
              </button>
            </>
          ) : (
            <div className="mt-3 text-gray-500 text-sm">
              No coding question
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MockInterviewVoice;