const express = require("express");
const upload = require("../config/cloudinary");
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require("../controllers/Productcontroller");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Admin only
router.post("/", authMiddleware, adminMiddleware, upload.array("images", 5), createProduct);
router.put("/:id", authMiddleware, adminMiddleware, upload.array("images", 5), updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;