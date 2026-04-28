import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = "https://devconnect-8fpj.onrender.com";

function AdminDashboard({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      if (!userId) {
        setError("Login required (userId missing)");
        return;
      }

      setLoading(true);
      setError("");

      const res = await axios.post(`${API}/api/admin/analysis`, { userId });
      setData(res.data);
    } catch (err) {
      console.log("ADMIN ERROR:", err.response?.data || err.message);
      setError("Failed to load analysis. Check if you have completed any interview first.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-cyan-400 text-xl animate-pulse">
          ⏳ Loading AI Analysis...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-6 rounded-xl max-w-md text-center">
          <p className="text-2xl mb-2">❌</p>
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-500 rounded-xl text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-center">
          <p className="text-4xl mb-4">📭</p>
          <p>No data found. Complete an interview first!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white p-6 space-y-6 max-w-4xl mx-auto">

      {/* HEADER */}
      <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-cyan-400">
          🚀 AI Interview Coach
        </h1>
        <p className="text-gray-400 mt-1">{data.userId}</p>
        <p className="text-gray-500 text-sm mt-1">
          Total Interviews: {data.totalInterviews}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/10 p-5 rounded-2xl border border-white/10 text-center">
          <p className="text-gray-400 text-sm">Level</p>
          <h2 className="text-green-400 text-2xl font-bold capitalize mt-1">
            {data.level}
          </h2>
        </div>

        <div className="bg-white/10 p-5 rounded-2xl border border-white/10 text-center">
          <p className="text-gray-400 text-sm">Avg Score</p>
          <h2 className="text-yellow-400 text-2xl font-bold mt-1">
            {data.avgScore}%
          </h2>
        </div>

        <div className="bg-white/10 p-5 rounded-2xl border border-white/10 text-center">
          <p className="text-gray-400 text-sm">Best Score</p>
          <h2 className="text-blue-400 text-2xl font-bold mt-1">
            {data.bestScore}%
          </h2>
        </div>
      </div>

      {/* WEAK AREA */}
      <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl">
        <p className="text-red-400 font-semibold text-lg">
          ⚠️ Weak Area: <span className="capitalize">{data.weakArea}</span>
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Focus on this topic to improve your overall score
        </p>
      </div>

      {/* ROADMAP */}
      <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
        <h2 className="text-cyan-400 font-bold text-lg mb-3">
          🗺️ Learning Roadmap
        </h2>
        <div className="space-y-2">
          {data.roadmap?.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
            >
              <span className="text-cyan-400 font-bold">{idx + 1}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI TEACHER */}
      <div className="bg-purple-500/10 border border-purple-500/30 p-5 rounded-2xl">
        <h2 className="text-purple-400 font-bold text-lg mb-2">
          🤖 AI Teacher Says
        </h2>
        <p className="text-gray-300">{data.explanation}</p>
      </div>

      {/* ACTION PLAN */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 p-5 rounded-2xl">
        <h2 className="text-yellow-400 font-bold text-lg mb-3">
          ✅ Action Plan
        </h2>
        <div className="space-y-2">
          {data.steps?.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
            >
              <span className="text-yellow-400">→</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;