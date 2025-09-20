const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

console.log("🔹 JWT_SECRET loaded:", jwtSecret);


const authMiddleware = (req, res, next) => {
  console.log("🔹 authMiddleware called");

  let token = req.headers["authorization"];
  console.log("🔹 Raw Authorization Header:", token);

  if (!token) {
    console.log("❌ No token provided in headers");
    return res.status(401).json({ message: "No token provided" });
  }

  // Remove "Bearer " prefix if present
  const parts = token.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer") {
    token = parts[1];
  } else if (parts.length === 1) {
    token = parts[0];
  } else {
    console.log("❌ Authorization header format is wrong");
    return res.status(401).json({ message: "Invalid authorization header format" });
  }

  // Remove any surrounding quotes
  token = token.replace(/^"|"$/g, '').trim();
  console.log("🔹 Token to verify:", token);
  console.log("🔹 Token length:", token.length);


  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log("✅ Token successfully decoded:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ Token verification failed!");
    console.log("   Token:", token);
    console.log("🔹 JWT_SECRET loaded:", jwtSecret);

    console.log("   Error message:", err.message);
    return res.status(401).json({ message: "Token is invalid" });
  }
};

const adminMiddleware = (req, res, next) => {
  console.log("🔹 adminMiddleware called for role:", req.user.role);
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  next();
};

module.exports = { authMiddleware, adminMiddleware, jwtSecret };
