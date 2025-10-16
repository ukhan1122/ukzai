const express = require("express");
const Order = require("../model/OrderModel");
const Product = require("../model/productmodel");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// Import notification services
const WhatsAppService = require("../services/whatsappService");
const EmailService = require("../services/emailService");

const router = express.Router();

console.log("🔹 OrderRoutes.js: File loaded successfully");

// ✅ Create order (user only) - WITH NOTIFICATIONS
router.post("/create", authMiddleware, async (req, res) => {
  console.log("👉 /orders/create called by:", req.user);

  try {
    const { items, totalPrice, shippingAddress } = req.body;

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
        images: product.images,
      };
    });

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalPrice,
      shippingAddress,
      status: "pending",
    });

    await order.save();
console.log("✅ Order created:", order._id);

// 🔍 DEBUG: Check if the function exists and can be called
console.log("🟡 DEBUG: Checking sendOrderNotifications function");
console.log("🟡 Function exists:", typeof sendOrderNotifications);
console.log("🟡 Is function:", typeof sendOrderNotifications === 'function');

// 🔍 DEBUG: Check if WhatsAppService exists
console.log('🟡 DEBUG: WhatsAppService exists:', !!WhatsAppService);
console.log('🟡 DEBUG: WhatsAppService methods:', Object.keys(WhatsAppService));

// 🔔 SEND NOTIFICATIONS (don't wait for response)
sendOrderNotifications(order)
  .then(results => {
    console.log('📢 Notifications sent:', results);
  })
  .catch(error => {
    console.error('⚠️ Notifications failed:', error);
  });

    res.status(201).json({ 
      message: "Order created successfully", 
      order,
      orderId: order._id 
    });
    
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
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get ALL orders (Admin only)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  console.log("👉 /orders/ called by admin:", req.user);

  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching all orders:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Update order status (Admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  console.log("👉 /orders/:id update called by admin:", req.user);

  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "completed", "cancelled"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    console.error("❌ Error updating order:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Test notifications endpoint (for testing only)
router.get("/test/notifications", async (req, res) => {
  try {
    console.log("🧪 Testing notifications...");
    
    const testOrder = {
      _id: "test_" + Date.now(),
      totalPrice: 1550,
      shippingAddress: {
        name: "Test Customer",
        phone: "03001234567",
        address: "Test Address, Islamabad"
      },
      items: [
        { name: "Buldak Hot Chicken Ramen", price: 550, quantity: 2 },
        { name: "Korean Rice Cakes", price: 450, quantity: 1 }
      ],
      createdAt: new Date()
    };

    const results = await sendOrderNotifications(testOrder);
    
    res.json({
      success: true,
      message: "Test notifications sent!",
      results: results
    });
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔔 Notification function (added at the bottom)
// 🔔 FIXED Notification function
async function sendOrderNotifications(order) {
  console.log('📢 Sending notifications for order:', order._id);
  
  try {
    console.log('🟡 DEBUG: Calling WhatsAppService...');
    const whatsappPromise = WhatsAppService.sendOrderNotification(order);
        console.log('🟡 DEBUG: WhatsApp promise created');
    
    console.log('🟡 DEBUG: Calling EmailService...');
    const emailPromise = EmailService.sendOrderNotification(order);
    
        console.log('🟡 DEBUG: Email promise created');

    // Wait for both with proper error handling
    const [whatsappResult, emailResult] = await Promise.allSettled([
      whatsappPromise,
      emailPromise
    ]);

    // Log individual results
    console.log('🟡 WhatsApp result:', whatsappResult);
    console.log('🟡 Email result:', emailResult);

    const results = {
      whatsapp: whatsappResult.status === 'fulfilled' ? whatsappResult.value : false,
      email: emailResult.status === 'fulfilled' ? emailResult.value : false
    };

    // Log any rejections
    if (whatsappResult.status === 'rejected') {
      console.error('❌ WhatsApp notification failed:', whatsappResult.reason);
    }
    if (emailResult.status === 'rejected') {
      console.error('❌ Email notification failed:', emailResult.reason);
    }

    console.log('📊 Final Notification Results:', results);
    return results;
    
  } catch (error) {
    console.error('❌ Notification system error:', error);
    return { whatsapp: false, email: false };
  }
}

module.exports = router;