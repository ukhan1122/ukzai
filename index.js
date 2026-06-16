require("dotenv").config();
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");  // ← ADD THIS LINE
const express = require("express");
const mongoose = require("mongoose");

const path = require("path");
const fs = require("fs");
 
const productRoutes = require('./routes/Productroutes');
const authRoutes = require('./routes/Authroutes');
const orderRoutes = require('./routes/Orderroutes');
 
const app  = express();
const PORT = process.env.PORT || 5000;
 
// ─── MongoDB ────────────────────────────────────────────────────────────────
 
const connectDB = async () => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000;
 
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, { dbName: "ukzaiDB" });
      console.log(`✅ MongoDB connected → ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`❌ MongoDB attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt === MAX_RETRIES) { console.error("🛑 Could not connect to MongoDB. Exiting."); process.exit(1); }
      console.log(`⏳ Retrying in ${RETRY_DELAY / 1000}s...`);
      await new Promise(r => setTimeout(r, RETRY_DELAY));
    }
  }
};
 
// ─── Uploads ────────────────────────────────────────────────────────────────
 
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
 
// ─── Middleware ──────────────────────────────────────────────────────────────
 
app.use(express.json());
 
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://ukzai.shop",
  "https://www.ukzai.shop",
];
 
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-requested-with");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});
 
app.use("/uploads", express.static(uploadDir));
 
// ─── Routes ──────────────────────────────────────────────────────────────────
 

app.use("/api/product", productRoutes);
app.use("/api/auth",    authRoutes);
app.use("/api/orders",  orderRoutes);
 
app.get("/",       (_req, res) => res.send("Backend is running."));
app.get("/health", (_req, res) => res.json({
  status:    "OK",
  database:  mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  timestamp: new Date().toISOString(),
}));
 
// ─── Boot ────────────────────────────────────────────────────────────────────
 
const boot = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 Server running → http://localhost:${PORT}`));
};
 
boot();
