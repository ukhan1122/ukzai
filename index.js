require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const mongodb = require("./config/mongodb");
const ProductRouter = require("./Router/ProductRouter");
const Auth = require("./Router/Authroutes");
const orderroutes = require("./Router/OrderRoutes");

const app = express();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(uploadDir));

// Routes
app.use("/api/orders", orderroutes);
app.use("/api/product", ProductRouter);
app.use("/api/auth", Auth);

// Database
mongodb();

// Test route
app.get("/", (req, res) => res.send("Backend is running..."));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
