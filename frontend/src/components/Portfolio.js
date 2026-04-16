import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function Portfolio({ userId }) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [projects, setProjects] = useState([
    { title: "", description: "", link: "" },
  ]);

  const addProject = () =>
    setProjects([...projects, { title: "", description: "", link: "" }]);

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const savePortfolio = async () => {
    try {
      const res = await axios.post(
        "https://devconnect-8fpj.onrender.com.com/api/portfolio/create",
        {
          userId,
          name,
          bio,
          projects,
        }
      );

      alert(res.data.message);
    } catch (err) {
      alert("Failed to save portfolio ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white p-6">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-blue-400">
          Smart Portfolio Builder 🚀
        </h1>
        <p className="text-gray-400">
          Build your developer profile in seconds
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* FORM SECTION */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">

          <input
            className="w-full p-3 mb-3 rounded bg-gray-700"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            className="w-full p-3 mb-3 rounded bg-gray-700"
            placeholder="Short Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <h2 className="font-bold mb-3 text-blue-300">Projects</h2>

          {projects.map((p, i) => (
            <div
              key={i}
              className="bg-gray-900 p-3 rounded mb-3 space-y-2"
            >
              <input
                className="w-full p-2 rounded bg-gray-700"
                placeholder="Project Title"
                value={p.title}
                onChange={(e) =>
                  updateProject(i, "title", e.target.value)
                }
              />

              <input
                className="w-full p-2 rounded bg-gray-700"
                placeholder="Description"
                value={p.description}
                onChange={(e) =>
                  updateProject(i, "description", e.target.value)
                }
              />

              <input
                className="w-full p-2 rounded bg-gray-700"
                placeholder="Live Link"
                value={p.link}
                onChange={(e) =>
                  updateProject(i, "link", e.target.value)
                }
              />
            </div>
          ))}

          <div className="flex gap-3 mt-4">
            <button
              onClick={addProject}
              className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
            >
              + Add Project
            </button>

            <button
              onClick={savePortfolio}
              className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Portfolio
            </button>
          </div>
        </div>

        {/* LIVE PREVIEW */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800 p-6 rounded-2xl shadow-lg"
        >
          <h2 className="text-xl font-bold text-green-400 mb-4">
            Live Preview 👀
          </h2>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold">{name || "Your Name"}</h3>
            <p className="text-gray-400">{bio || "Your bio appears here..."}</p>

            <div className="mt-4">
              <h4 className="font-bold text-blue-300">Projects</h4>

              {projects.map((p, i) => (
                <div
                  key={i}
                  className="bg-gray-900 p-3 rounded mt-2"
                >
                  <p className="font-bold">{p.title || "Project Title"}</p>
                  <p className="text-gray-400 text-sm">
                    {p.description || "Project description"}
                  </p>

                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 text-sm"
                    >
                      Visit Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Portfolio;