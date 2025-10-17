const express = require("express");
const Order = require("../model/OrderModel");
const Product = require("../model/productmodel");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const WhatsAppService = require("../services/whatsappService");
const EmailService = require("../services/emailService");

const router = express.Router();

// ✅ Create order (user only) - WITH NOTIFICATIONS
router.post("/create", authMiddleware, async (req, res) => {
  console.log("👉 /orders/create called by:", req.user);

  try {
    const { items, totalPrice, shippingAddress } = req.body;

    // ✅ Log shipping address to verify all fields
    console.log("📦 Shipping Address:", shippingAddress);

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
      shippingAddress: {
        name: shippingAddress.name,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city, // ✅ City field
        postalCode: shippingAddress.postalCode // ✅ Postal Code field
      },
      status: "pending",
    });

    await order.save();
    console.log("✅ Order created with full address details");

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
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get ALL orders (Admin only) - WITH PHONE, CITY, POSTAL CODE
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone city postalCode") // ✅ Added all fields
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching all orders:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Update order status (Admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
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
    ).populate("user", "name email phone city postalCode"); // ✅ Added all fields

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    console.error("❌ Error updating order:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🔔 Notification function
async function sendOrderNotifications(order) {
  console.log('📢 Sending notifications for order:', order._id);
  
  try {
    const [whatsappResult, emailResult] = await Promise.allSettled([
      WhatsAppService.sendOrderNotification(order),
      EmailService.sendOrderNotification(order)
    ]);

    const results = {
      whatsapp: whatsappResult.status === 'fulfilled' ? whatsappResult.value : false,
      email: emailResult.status === 'fulfilled' ? emailResult.value : false
    };

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