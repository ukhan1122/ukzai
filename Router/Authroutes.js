const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/Authmodel");
const { authMiddleware, adminMiddleware, jwtSecret } = require("../middleware/auth");

const router = express.Router();

// ✅ Signup
router.post("/signup", async (req, res) => {
  
  console.log("⚡ Signup route hit"); // <--- add this
  try {
    const { name, email, password, role } = req.body;
    console.log("👉 Signup attempt:", { name, email, role });

    if (email === "explain816@gmail.com") {
      console.log("❌ Email reserved for admin");
      return res.status(400).json({ message: "This email is reserved for admin" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔑 Password hashed successfully");

    const user = new User({ name, email, password: hashedPassword, role: role || "user" });
    
    // Save user and confirm success
    await user.save()
      .then(savedUser => {
        console.log("✅ User saved in DB:", savedUser);
        res.status(201).json({ message: "User created successfully", user: savedUser });
      })
      .catch(saveErr => {
        console.error("❌ Error saving user:", saveErr);
        res.status(500).json({ message: "Error saving user", error: saveErr.message });
      });

  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("👉 Login attempt received:", { email });

    // Hardcoded admin login
    if (email === "explain816@gmail.com" && password === "12345") {
      console.log("✅ Hardcoded admin login successful");
      const token = jwt.sign({ id: "admin-id", role: "admin" }, jwtSecret, { expiresIn: "1d" });

      return res.json({ token, role: "admin", user: { name: "Admin", email } });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: "1d" });
    console.log("✅ Login successful for:", email);

    res.json({ token, role: user.role, user: { id: user._id, name: user.name, email: user.email } });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Admin route
router.get("/admin", authMiddleware, adminMiddleware, (req, res) => {
  console.log("👉 Admin route accessed by:", req.user);
  res.json({ message: "Welcome Admin! You can access this route." });
});

module.exports = router;
