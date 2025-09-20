const express = require("express");
const Order = require("../model/OrderModel");
const Product = require("../model/productmodel"); // ✅ import product model
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// ✅ Create order (user only)
router.post("/create", authMiddleware, async (req, res) => {
  console.log("👉 /orders/create called by:", req.user);

  try {
    const { items, totalPrice } = req.body;

    // ✅ Extract product IDs from items
    const productIds = items.map((i) => i.productId);

    // ✅ Fetch product details
    const products = await Product.find({ _id: { $in: productIds } });

    // ✅ Build order items with product details
    const orderItems = items.map((i) => {
      const product = products.find((p) => p._id.toString() === i.productId);
      if (!product) {
        throw new Error(`Product not found for ID: ${i.productId}`);
      }

      return {
        name: product.name,
        quantity: i.quantity,
        price: product.price,
        images: product.images, // ✅ copy images into order item
      };
    });

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalPrice,
      status: "pending",
    });

    await order.save();
    console.log("✅ Order created:", order._id);

    res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    console.error("❌ Error creating order:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get all orders for the logged-in user
router.get("/myorders", authMiddleware, async (req, res) => {
  console.log("👉 /orders/myorders called by:", req.user);

  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
