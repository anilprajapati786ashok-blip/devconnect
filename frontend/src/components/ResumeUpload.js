import React, { useState } from 'react';
import axios from 'axios';

function ResumeUpload() {

  // ===== SAME STATES =====
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [improvedResume, setImprovedResume] = useState("");
  const [questions, setQuestions] = useState([]); 
  const [chat, setChat] = useState([]);
  const [userMsg, setUserMsg] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // ===== SAME FUNCTIONS =====
  const uploadResume = async () => {
    if (!file) return alert("Please select a file ");

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await axios.post('https://devconnect-8fpj.onrender.com/api/resume/upload', formData);

      setUploadedFile(res.data.resume);
      setAnalysis(null);
      setMatchResult(null);
      setImprovedResume("");
      setQuestions([]);
      setChat([]);

      alert("Resume uploaded ");
    } catch (err) {
      console.log(err);
      alert("Upload failed ");
    }
  };

  const analyzeResume = async () => {
    if (!uploadedFile) return alert("Upload resume first ");

    try {
      const res = await axios.post('https://devconnect-8fpj.onrender.com/api/analyze-resume', {
        resumeText: uploadedFile.text
      });

      setAnalysis(res.data);
    } catch {
      alert("Analyze failed ");
    }
  };

  const matchJob = async () => {
    if (!uploadedFile) return alert("Upload resume first ");
    if (!jobDesc) return alert("Paste job description ");

    try {
      const res = await axios.post('https://devconnect-8fpj.onrender.com/api/job-match', {
        resumeText: uploadedFile.text,
        jobDescription: jobDesc
      });

      setMatchResult(res.data);
    } catch {
      alert("Match failed ");
    }
  };

  const fixResume = async () => {
    if (!uploadedFile) return alert("Upload resume first ");

    try {
      const res = await axios.post('https://devconnect-8fpj.onrender.com/api/resume-fixer', {
        resumeText: uploadedFile.text
      });

      setImprovedResume(res.data.improvedResume);
    } catch {
      alert("Fix failed ");
    }
  };

  const generateQuestions = async () => {
    if (!uploadedFile) return alert("Upload resume first ");

    try {
      const res = await axios.post('https://devconnect-8fpj.onrender.com/api/interview', {
        resumeText: uploadedFile.text
      });

      setQuestions(res.data.questions);
    } catch {
      alert("Failed to generate questions ");
    }
  };

  const sendMessage = async () => {
    if (!userMsg) return;
    if (!uploadedFile) return alert("Upload resume first ");

    const newChat = [...chat, { role: "user", content: userMsg }];
    setChat(newChat);
    setUserMsg("");

    try {
      const res = await axios.post('https://devconnect-8fpj.onrender.com/api/mock-interview', {
        resumeText: uploadedFile.text,
        messages: newChat
      });

      setChat([...newChat, { role: "assistant", content: res.data.reply }]);
    } catch {
      alert("Mock interview failed ");
    }
  };

  // ===== UI ONLY UPDATED =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <h2 className="text-4xl font-bold text-center">🚀 AI Resume Analyzer</h2>

        {/* Upload */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
          <input type="file" onChange={handleFileChange} />

          <div className="flex flex-wrap gap-3 mt-4">
            <button onClick={uploadResume} className="bg-blue-500 px-4 py-2 rounded-lg">Upload</button>
            <button onClick={analyzeResume} className="bg-purple-500 px-4 py-2 rounded-lg">Analyze</button>
            <button onClick={fixResume} className="bg-green-500 px-4 py-2 rounded-lg">Improve</button>
            <button onClick={generateQuestions} className="bg-pink-500 px-4 py-2 rounded-lg">Questions</button>
          </div>

          {uploadedFile && (
            <p className="mt-3 text-green-400">Uploaded: {uploadedFile.originalname}</p>
          )}
        </div>

        {/* ATS FULL */}
        {analysis && (
          <div className="bg-slate-800 p-6 rounded-2xl">
            <h3 className="text-2xl font-semibold mb-3">ATS Analysis 🤖</h3>

            <p className="text-lg"><b>Score:</b> {analysis.overall_score}</p>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <p>Content: {analysis.category_scores?.content_quality}</p>
              <p>Skills: {analysis.category_scores?.skills_relevance}</p>
              <p>Experience: {analysis.category_scores?.experience_strength}</p>
              <p>Structure: {analysis.category_scores?.structure_formatting}</p>
              <p>ATS: {analysis.category_scores?.ats_compatibility}</p>
            </div>

            <h4 className="mt-4 font-semibold">Strengths</h4>
            <ul className="list-disc ml-6">
              {analysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
            </ul>

            <h4 className="mt-4 font-semibold">Weaknesses</h4>
            <ul className="list-disc ml-6">
              {analysis.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
            </ul>

            <h4 className="mt-4 font-semibold">Improvements</h4>
            <ul className="ml-6">
              {analysis.improvements?.map((imp, i) => (
                <li key={i} className="mb-2">
                  <b>Issue:</b> {imp.issue}<br/>
                  <b>Fix:</b> {imp.fix}<br/>
                  <b>Example:</b> {imp.example}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* JOB MATCH FULL */}
        <div className="bg-slate-800 p-6 rounded-2xl">
          <h3 className="text-xl mb-2">Job Match 💼</h3>

          <textarea
            className="w-full p-3 rounded text-black"
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          />

          <button onClick={matchJob} className="mt-3 bg-blue-600 px-4 py-2 rounded-lg">
            Match Job
          </button>

          {matchResult && (
            <div className="mt-4">
              <p className="font-semibold">Score: {Math.round(matchResult.matchScore * 100)}%</p>

              <p><b>Matched Skills:</b></p>
              <ul className="list-disc ml-6">
                {matchResult.matchedSkills?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>

              <p><b>Missing Skills:</b></p>
              <ul className="list-disc ml-6">
                {matchResult.missingSkills?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>

              <p><b>AI Insight:</b> {matchResult.summary}</p>
            </div>
          )}
        </div>

        {/* IMPROVED */}
        {improvedResume && (
          <div className="bg-green-700 p-6 rounded-2xl">
            <h3 className="text-xl mb-2">Improved Resume ✨</h3>
            <pre className="whitespace-pre-wrap">{improvedResume}</pre>
          </div>
        )}

        {/* QUESTIONS */}
        {questions.length > 0 && (
          <div className="bg-blue-700 p-6 rounded-2xl">
            <h3 className="text-xl mb-2">Interview Questions 🎯</h3>
            <ul className="list-disc ml-6">
              {questions.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </div>
        )}

        {/* MOCK INTERVIEW */}
        <div className="bg-slate-800 p-6 rounded-2xl">
          <h3 className="text-xl mb-2">Mock Interview 🎤</h3>

          <div className="h-64 overflow-y-auto bg-slate-700 p-3 rounded mb-3">
            {chat.map((msg, i) => (
              <p key={i}><b>{msg.role === "user" ? "You" : "AI"}:</b> {msg.content}</p>
            ))}
          </div>

          <input
            value={userMsg}
            onChange={(e) => setUserMsg(e.target.value)}
            className="w-full p-2 rounded text-black mb-2"
            placeholder="Type your answer..."
          />

          <button onClick={sendMessage} className="bg-yellow-500 px-4 py-2 rounded-lg">
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

export default ResumeUpload;