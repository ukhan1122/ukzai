const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  Createproduct,
  GetAllProducts,
  GetProductById,
  UpdateProduct,
  DeleteProduct,
} = require("../Product/Product");

const router = express.Router();

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Uploads folder created");
}

// ✅ Multer setup for multiple image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images are allowed!"), false);
    }
    cb(null, true);
  },
});

// ✅ Routes

// Create Product (multiple images)
router.post("/", upload.array("images", 5), Createproduct);

// Get All Products
router.get("/", GetAllProducts);

// Get Single Product by ID
router.get("/:id", GetProductById);

// Update Product (multiple images)
router.put("/:id", upload.array("images", 5), UpdateProduct);

// Delete Product
router.delete("/:id", DeleteProduct);

module.exports = router;
