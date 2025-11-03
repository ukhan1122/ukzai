const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 1 },
    images: [{ type: String }], // ✅ multiple images
    imagePrices: { type: Object, default: {} } // ✅ CHANGED: Use Object instead of Map
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);