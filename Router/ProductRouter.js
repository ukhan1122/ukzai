const express = require("express");
const upload = require("./../config/cloudinary");
const {
  Createproduct,
  GetAllProducts,
  GetProductById,
  UpdateProduct,
  DeleteProduct,
} = require("../Product/Product");
const Product = require("../model/productmodel"); // Make sure this import exists

const router = express.Router();

// Your existing routes here...
router.post("/", upload.array("images", 5), Createproduct);
router.get("/", GetAllProducts);
router.get("/:id", GetProductById);
router.put("/:id", upload.array("images", 5), UpdateProduct);
router.delete("/:id", DeleteProduct);

// ✅ ADD THIS NEW ROUTE AT THE BOTTOM
router.get("/fix/broken-images", async (req, res) => {
  try {
    const products = await Product.find({});
    let fixedCount = 0;

    for (let product of products) {
      // Delete products with broken images
      if (product.images && product.images.some(img => img.includes('…'))) {
        await Product.findByIdAndDelete(product._id);
        fixedCount++;
        console.log(`Deleted product with broken images: ${product.name}`);
      }
    }

    res.json({ 
      message: `Deleted ${fixedCount} products with broken images. Please recreate them.`,
      deleted: fixedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;