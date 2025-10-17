const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
        images: { type: [String], default: [] },
      },
    ],
    totalPrice: { type: Number, required: true },
    shippingAddress: {
      name: String,
      email: String,
      phone: String, // ✅ ADD THIS LINE
      address: String,
    },
    status: { 
      type: String, 
      default: "pending",
      enum: ["pending", "processing", "completed", "cancelled"]
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);