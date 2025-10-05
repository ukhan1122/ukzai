const express = require("express");
const upload = require("../utils/cloudinary"); // Import your Cloudinary upload
const {
  Createproduct,
  GetAllProducts,
  GetProductById,
  UpdateProduct,
  DeleteProduct,
} = require("../Product/Product");

const router = express.Router();

// ✅ Routes - Use Cloudinary upload middleware

// Create Product (multiple images) - WITH CLOUDINARY
router.post("/", upload.array("images", 5), Createproduct);

// Get All Products
router.get("/", GetAllProducts);

// Get Single Product by ID
router.get("/:id", GetProductById);

// Update Product (multiple images) - WITH CLOUDINARY
router.put("/:id", upload.array("images", 5), UpdateProduct);

// Delete Product
router.delete("/:id", DeleteProduct);

module.exports = router;