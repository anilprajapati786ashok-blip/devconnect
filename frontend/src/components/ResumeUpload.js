import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function ResumeUpload() {
  // ================= CORE =================
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [matchResult, setMatchResult] = useState(null);

  const [chat, setChat] = useState([]);
  const [userMsg, setUserMsg] = useState("");

  const [score, setScore] = useState(0);
  const [decision, setDecision] = useState("");

  const [persona, setPersona] = useState("friendly");

  const [isListening, setIsListening] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // ================= REFS =================
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);

  const API = "https://devconnect-8fpj.onrender.com";

  // ================= SAFE CHECK =================
  const hasResume = () => Boolean(uploadedFile?.text);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // ================= CAMERA =================
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      alert("Camera not allowed");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((t) => t.stop());
    setCameraOn(false);
  };

  // ================= SCORE =================
  const evaluateAnswer = (text) => {
    if (!text) return 0;

    let base = 50 + Math.min(text.length / 10, 20);

    ["react", "javascript", "api", "frontend", "backend"].forEach((k) => {
      if (text.toLowerCase().includes(k)) base += 5;
    });

    return Math.min(100, Math.round(base));
  };

  const makeDecision = (s) => {
    if (s >= 80) return "🟢 Hired";
    if (s >= 60) return "🟡 Maybe";
    return "🔴 Rejected";
  };

  // ================= SPEECH =================
  const speak = (text) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = persona === "strict" ? 1.1 : 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  };

  const startListening = () => {
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) return alert("Speech not supported");

    const rec = new SR();
    rec.lang = "en-US";

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);

    rec.onresult = (e) =>
      setUserMsg(e.results[0][0].transcript);

    rec.start();
  };

  // ================= UPLOAD =================
  const uploadResume = async () => {
    if (!file) return alert("Select file first");

    try {
      const form = new FormData();
      form.append("resume", file);

      const res = await axios.post(`${API}/api/resume/upload`, form);

      setUploadedFile(res.data.resume);

      setAnalysis(null);
      setMatchResult(null);
      setChat([]);
      setScore(0);
      setDecision("");

      // 🚀 START INTERVIEW AFTER UPLOAD
      startInterview(res.data.resume.text);
    } catch {
      alert("Upload failed");
    }
  };

  // ================= START INTERVIEW (AI FIRST QUESTION) =================
  const startInterview = async (resumeText) => {
    try {
      setIsAIThinking(true);

      const res = await axios.post(`${API}/api/mock-interview`, {
        resumeText,
        messages: [],
      });

      const question = res.data.reply;

      const firstChat = [
        { role: "assistant", content: question },
      ];

      setChat(firstChat);
      speak(question);
    } catch (err) {
      console.log(err);
    }

    setIsAIThinking(false);
  };

  // ================= SEND MESSAGE (REAL AI FLOW) =================
  const sendMessage = async () => {
    if (!userMsg || !hasResume()) return;

    const newChat = [...chat, { role: "user", content: userMsg }];
    setChat(newChat);

    const newScore = evaluateAnswer(userMsg);
    const finalScore = Math.round((score + newScore) / 2);

    setScore(finalScore);
    setDecision(makeDecision(finalScore));

    setUserMsg("");
    setIsAIThinking(true);

    try {
      const res = await axios.post(`${API}/api/mock-interview`, {
        resumeText: uploadedFile.text,
        messages: newChat,
      });

      const question = res.data.reply;

      const updatedChat = [
        ...newChat,
        { role: "assistant", content: question },
      ];

      setChat(updatedChat);
      speak(question);
    } catch (err) {
      console.log(err);
    }

    setIsAIThinking(false);
  };

  // ================= ANALYZE =================
  const analyzeResume = async () => {
    if (!hasResume()) return;

    const res = await axios.post(`${API}/api/analyze-resume`, {
      resumeText: uploadedFile.text,
    });

    setAnalysis(res.data || null);
  };

  // ================= JOB MATCH =================
  const matchJob = async () => {
    if (!hasResume()) return;

    const res = await axios.post(`${API}/api/job-match`, {
      resumeText: uploadedFile.text,
      jobDescription: jobDesc,
    });

    setMatchResult(res.data || null);
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl font-bold text-center">
        🚀 REAL AI Interview System
      </h1>

      {/* CAMERA */}
      <div className="flex flex-col items-center mt-4">
        <video ref={videoRef} autoPlay className="w-96 h-64 bg-gray-800 rounded" />

        <div className="flex gap-3 mt-2">
          {!cameraOn ? (
            <button onClick={startCamera}>Start Camera</button>
          ) : (
            <button onClick={stopCamera}>Stop Camera</button>
          )}
        </div>
      </div>

      {/* PERSONA */}
      <div className="text-center mt-3">
        <select
          className="text-black p-2"
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
        >
          <option value="friendly">Friendly AI</option>
          <option value="strict">Strict AI</option>
        </select>
      </div>

      {/* SCORE */}
      <div className="text-center mt-4">
        <p>Score: {score}</p>
        <p>{decision}</p>
      </div>

      {/* UPLOAD */}
      <div className="bg-white/10 p-4 mt-4 rounded">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button
          onClick={uploadResume}
          className="px-5 py-2 mr-3 rounded-xl bg-blue-500 text-white font-semibold shadow-lg hover:shadow-blue-400/50 hover:scale-105 transition-all duration-300"
        >
          Upload
        </button>
        <button
          onClick={analyzeResume}
          className="px-5 py-2 rounded-xl bg-pink-500 text-white font-semibold shadow-lg hover:shadow-pink-400/50 hover:scale-105 transition-all duration-300"
        >
          Analyze
        </button>
      </div>

      {/* ANALYSIS */}
      {analysis && (
        <pre className="bg-green-500/20 p-2 mt-2 rounded text-xs">
          {JSON.stringify(analysis, null, 2)}
        </pre>
      )}

      {/* JOB */}
      <div className="bg-white/10 p-4 mt-4 rounded">
        <textarea
          className="w-full text-black p-2"
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        />

        <button
          onClick={matchJob}
          className="px-5 py-2 rounded-xl bg-green-500 text-white font-semibold shadow-lg hover:shadow-green-400/50 hover:scale-105 transition-all duration-300"
        >
          Match Job
        </button>
      </div>

      {/* MATCH */}
      {matchResult && (
        <pre className="bg-blue-500/20 p-2 mt-2 rounded text-xs">
          {JSON.stringify(matchResult, null, 2)}
        </pre>
      )}

      {/* CHAT */}
      <div className="bg-white/10 p-4 mt-4 rounded">
        <div className="h-60 overflow-y-auto">
          {chat.map((m, i) => (
            <p key={i}>
              <b>{m.role}:</b> {m.content}
            </p>
          ))}
          <div ref={chatEndRef} />
        </div>

        {isAIThinking && <p>🤖 AI thinking...</p>}
        {isListening && <p>🎤 Listening...</p>}

        <input
          className="w-full text-black p-2 mt-2"
          value={userMsg}
          onChange={(e) => setUserMsg(e.target.value)}
        />

        <button
          onClick={startListening}
          className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold shadow-lg hover:shadow-red-400/50 hover:scale-105 transition-all duration-300"
        >
          🎤 Speak
        </button>
        <button
          onClick={sendMessage}
          className="px-5 py-2 rounded-xl bg-violet-500 text-white font-semibold shadow-lg hover:shadow-violet-400/50 hover:scale-105 transition-all duration-300"
        >
          Send
        </button>
      </div>

    </div>
  );
}

export default ResumeUpload;