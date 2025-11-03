const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 1 },
    images: [{ type: String }], // ✅ multiple images
    imagePrices: { type: Map, of: Number, default: {} } // ✅ NEW: Individual prices for each image
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);