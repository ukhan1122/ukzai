const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose"); // ADD THIS IMPORT
const User = require("../model/Authmodel");
const { authMiddleware, adminMiddleware, jwtSecret } = require("../middleware/auth");

const router = express.Router();

// ✅ Signup
router.post("/signup", async (req, res) => {
  
  console.log("⚡ Signup route hit");
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
    const savedUser = await user.save();
    console.log("✅ User saved in DB:", savedUser);

    // 🔍 ADD VERIFICATION HERE - RIGHT AFTER SAVING
    console.log("🔍 Starting database verification...");
    
    // Verify the user was actually saved by finding them again
    const verifyUser = await User.findById(savedUser._id);
    console.log("🔍 Verification - User found in DB:", verifyUser);

    // Count total users in database
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);

    // List all users for debugging
    const allUsers = await User.find({});
    console.log("👥 All users in database:", allUsers);

    res.status(201).json({ 
      message: "User created successfully", 
      user: savedUser,
      verification: {
        verified: !!verifyUser,
        totalUsers: userCount
      }
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

// 🔍 ADD DEBUG ROUTE
router.get("/debug/users", async (req, res) => {
  try {
    const users = await User.find({});
    const userCount = await User.countDocuments();
    
    console.log('🔍 Debug - All users in DB:', users);
    console.log(`📊 Debug - Total users: ${userCount}`);
    
    res.json({
      database: mongoose.connection.db.databaseName,
      totalUsers: userCount,
      users: users
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🔍 ADD CONNECTION DEBUG ROUTE - ADD THIS NEW ROUTE
router.get("/debug/connection", async (req, res) => {
  try {
    const connection = mongoose.connection;
    const client = connection.client;
    
    res.json({
      database: connection.db.databaseName,
      host: connection.host,
      port: connection.port,
      cluster: connection.client.s.options.srvHost,
      connectionString: process.env.MONGO_URI ? 
        process.env.MONGO_URI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://username:****@') : 
        'Not found'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;