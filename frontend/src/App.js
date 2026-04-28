import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

import Portfolio from "./components/Portfolio";
import ResumeUpload from "./components/ResumeUpload";
import MockInterviewVoice from "./components/MockInterviewVoice";
import AdminDashboard from "./components/AdminDashboard";

/* ================= DASHBOARD ================= */
function DashboardHome({ user, setActiveTab }) {
  const cards = [
    {
      title: "AI Interview",
      icon: "🎤",
      color: "from-blue-500 to-cyan-400",
      action: () => setActiveTab("voice"),
    },
    {
      title: "Resume Analyzer",
      icon: "📄",
      color: "from-purple-500 to-pink-500",
      action: () => setActiveTab("resume"),
    },
    {
      title: "Portfolio",
      icon: "💼",
      color: "from-green-400 to-emerald-500",
      action: () => setActiveTab("portfolio"),
    },
    {
      title: "Admin Panel",
      icon: "👤",
      color: "from-orange-400 to-red-500",
      action: () => setActiveTab("admin"),
    },
  ];

  return (
    <div className="text-white">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold">
          Welcome back,{" "}
          <span className="text-cyan-400">{user?.name || "User"}</span> 👋
        </h1>
        <p className="text-gray-400 mt-2">
          Ready to crack your next interview? 🚀
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            onClick={card.action}
            whileHover={{ scale: 1.05, rotateX: 6, rotateY: -6 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`cursor-pointer rounded-2xl p-6 bg-gradient-to-br ${card.color} shadow-xl hover:shadow-cyan-400/40`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <span className="text-2xl">{card.icon}</span>
            </div>

            <p className="text-sm mt-4 opacity-80">
              Click to explore →
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


/* ================= APP ================= */
function App() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [isLogin, setIsLogin] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const API = "https://devconnect-8fpj.onrender.com";
  //"https://devconnect-8fpj.onrender.com"//

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async () => {
    try {
      const res = await axios.post(`${API}/api/auth/signup`, form);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch {
      alert("Signup failed ❌");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/api/auth/login`, form);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch {
      alert("Login failed ❌");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setActiveTab("dashboard");
  };

  // ================= AUTH =================
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-[420px] p-8 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20"
        >
          <h1 className="text-4xl font-bold text-center text-cyan-400 mb-6">
            ⚡ DevConnect AI
          </h1>

          {!isLogin && (
            <input
              name="name"
              placeholder="Name"
              onChange={handleChange}
              className="w-full p-3 mb-3 rounded-xl bg-black/40 border border-gray-600"
            />
          )}

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 mb-3 rounded-xl bg-black/40 border border-gray-600"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 mb-4 rounded-xl bg-black/40 border border-gray-600"
          />

          <button
            onClick={isLogin ? handleLogin : handleSignup}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold"
          >
            {isLogin ? "Login" : "Create Account"}
          </button>

          <p
            onClick={() => setIsLogin(!isLogin)}
            className="mt-4 text-center text-cyan-400 cursor-pointer"
          >
            {isLogin ? "Create account" : "Already have account?"}
          </p>
        </motion.div>
      </div>
    );
  }

  // ================= MAIN =================
  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* SIDEBAR */}
      <div className="w-72 p-5 bg-white/5 backdrop-blur-xl border-r border-white/10">

        <h1 className="text-2xl font-bold text-cyan-400">
          ⚡ DevConnect AI
        </h1>

        <p className="text-gray-400 mt-2">
          Welcome 🚀 {user?.name}
        </p>

        <div className="mt-6 space-y-2">

          {[
            ["dashboard", "🏠 Dashboard"],
            ["resume", "📄 Resume AI"],
            ["portfolio", "💼 Portfolio"],
            ["voice", "🎤 Voice Interview"],
            ["admin", "⚡ Admin Panel"],
          ].map(([key, label]) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab(key)}
              className={`p-3 rounded-xl cursor-pointer ${
                activeTab === key
                  ? "bg-cyan-500 text-black font-bold"
                  : "hover:bg-white/10"
              }`}
            >
              {label}
            </motion.div>
          ))}

        </div>

        <button
          onClick={logout}
          className="mt-8 w-full py-2 rounded-xl bg-red-500"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">

        {activeTab === "dashboard" && (
           <DashboardHome user={user} setActiveTab={setActiveTab} />
        )}

        {activeTab === "resume" && (
          <ResumeUpload userId={user?.email} />
        )}

        {activeTab === "portfolio" && (
          <Portfolio userId={user?.email} />
        )}

        {activeTab === "voice" && (
          <MockInterviewVoice userId={user?.email} />
        )}

        {activeTab === "admin" && user && (
          <AdminDashboard userId={user?.email} />
        )}

      </div>
    </div>
  );
}

export default App;