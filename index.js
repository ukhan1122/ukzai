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
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB Atlas");
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
// ✅ Middleware
// -------------------
app.use(express.json());

// -------------------
// ✅ Dynamic CORS Setup
// -------------------
const allowedOrigins = ["http://localhost:3000", "https://ukzai.shop"];

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
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") return res.sendStatus(200);

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
// ✅ Start Server
// -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
