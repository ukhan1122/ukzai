require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// Routers
const ProductRouter = require("./Router/ProductRouter");
const AuthRouter = require("./Router/Authroutes");
const OrderRoutes = require("./Router/OrderRoutes");

const app = express();
// -------------------
// ✅ MongoDB Atlas Connection
// -------------------
const connectDB = async () => {
  try {
    console.log("🔗 Attempting MongoDB connection...");
    console.log("📝 Connection string:", process.env.MONGO_URI ? "Present" : "Missing");
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "ukzaiDB"
    });

    console.log("✅ Connected to MongoDB Atlas");
    console.log("✅ Connected to DB:", conn.connection.name);
    console.log("✅ Host:", conn.connection.host);
    console.log("✅ Port:", conn.connection.port);

    // Test the connection by listing collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log("📂 Collections in database:", collections.map(c => c.name));

  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

connectDB();

// -------------------
// ✅ Uploads Folder
// -------------------
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// -------------------
// ✅ Middleware - MUST BE BEFORE ROUTES
// -------------------
app.use(express.json());

// -------------------
// ✅ FIXED CORS Setup - Add your domain here
// -------------------
const allowedOrigins = [
  "http://localhost:3000", 
  "https://ukzai.shop",
  "https://www.ukzai.shop"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-requested-with"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Serve uploads
app.use("/uploads", express.static(uploadDir));

// -------------------
// ✅ Routes
// -------------------
app.use("/api/product", ProductRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/orders", OrderRoutes);

// -------------------
// ✅ Test Route
// -------------------
app.get("/", (req, res) => res.send("Backend is running..."));

// -------------------
// ✅ Health Check Route
// -------------------
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString()
  });
});

// -------------------
// ✅ Start Server
// -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);