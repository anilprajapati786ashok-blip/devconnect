import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Portfolio from "./components/Portfolio";
import ResumeUpload from "./components/ResumeUpload";

function App() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLogin, setIsLogin] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        form
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch {
      alert("Signup failed ❌");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch {
      alert("Login failed ❌");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // ================= AUTH =================
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
        <motion.div className="bg-gray-800 p-8 rounded-xl w-80 shadow-xl">
          <h1 className="text-2xl font-bold mb-5 text-center text-blue-400">
            DevConnect Pro 🚀
          </h1>

          {!isLogin && (
            <input
              name="name"
              placeholder="Name"
              onChange={handleChange}
              className="w-full p-2 mb-3 rounded bg-gray-700"
            />
          )}

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-2 mb-3 rounded bg-gray-700"
          />

          <input
            name="password"
            placeholder="Password"
            type="password"
            onChange={handleChange}
            className="w-full p-2 mb-4 rounded bg-gray-700"
          />

          {isLogin ? (
            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 py-2 rounded"
            >
              Login
            </button>
          ) : (
            <button
              onClick={handleSignup}
              className="w-full bg-green-500 py-2 rounded"
            >
              Signup
            </button>
          )}

          <p
            className="text-center mt-4 text-blue-400 cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Create account" : "Already have account?"}
          </p>
        </motion.div>
      </div>
    );
  }

  // ================= DASHBOARD =================
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-black p-5 space-y-6">
        <h1 className="text-xl font-bold text-blue-400">
          DevConnect 🚀
        </h1>

        {[
          { key: "dashboard", label: "Dashboard" },
          { key: "resume", label: "Resume AI" },
          { key: "portfolio", label: "Portfolio" },
        ].map((item) => (
          <div
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`p-2 rounded cursor-pointer transition ${
              activeTab === item.key
                ? "bg-blue-600"
                : "hover:bg-gray-800"
            }`}
          >
            {item.label}
          </div>
        ))}

        <button
          onClick={logout}
          className="bg-red-500 w-full py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        {/* ================= DASHBOARD CARDS (FIXED + CLICKABLE) ================= */}
        {activeTab === "dashboard" && (
          <motion.div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome {user.name} 👋
            </h1>

            <p className="text-gray-400 mb-6">
              AI Career Assistant Dashboard
            </p>

            {/* 🔥 FIXED CARDS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {[
                {
                  title: "Resume AI",
                  desc: "Analyze your resume instantly",
                  tab: "resume",
                },
                {
                  title: "Job Match",
                  desc: "Check skill compatibility",
                  tab: "resume",
                },
                {
                  title: "Portfolio Builder",
                  desc: "Create your developer profile",
                  tab: "portfolio",
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(card.tab)}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg cursor-pointer border border-gray-700 hover:border-blue-500 transition-all"
                >
                  <h2 className="text-xl font-bold text-white">
                    {card.title}
                  </h2>

                  <p className="text-gray-400 mt-2">
                    {card.desc}
                  </p>

                  <div className="mt-4 text-blue-400 text-sm">
                    Click to open →
                  </div>
                </motion.div>
              ))}

            </div>
          </motion.div>
        )}

        {/* RESUME */}
        {activeTab === "resume" && (
          <ResumeUpload userId={user._id} />
        )}

        {/* PORTFOLIO */}
        {activeTab === "portfolio" && (
          <Portfolio userId={user._id} />
        )}

      </div>
    </div>
  );
}

export default App;