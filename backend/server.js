// ================= AUTH ROUTES (QUICK FIX) =================

// SIGNUP
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body;

  console.log("Signup request:", req.body);

  res.json({
    success: true,
    user: { name, email },
  });
});

// LOGIN
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  console.log("Login request:", req.body);

  res.json({
    success: true,
    user: { email },
  });
});