const mongoose = require("mongoose");

const connectDB = async () => {
try {
  await user.save();
  console.log("✅ User created:", email);
  res.status(201).json({ message: "User created successfully" });
} catch (dbError) {
  console.error("❌ MongoDB save error:", dbError);
  res.status(500).json({ message: "DB save error", error: dbError.message });
}

};

module.exports = connectDB;
