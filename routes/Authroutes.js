const express                    = require("express");
const { signup, login } = require("../controllers/Authcontroller");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login",  login);

// Protected admin check route
router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
