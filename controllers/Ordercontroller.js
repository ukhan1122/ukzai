const Order          = require("../model/Order");
const Product        = require("../model/Product");
const EmailService   = require("../services/emailService");
const TelegramService = require("../services/whatsappService");

// ─── Create Order ────────────────────────────────────────────────────────────

const createOrder = async (req, res) => {
  try {
    const { items, totalPrice, shippingAddress } = req.body;

    if (!items?.length || !totalPrice || !shippingAddress)
      return res.status(400).json({ message: "Missing order details" });

    const productIds = items.map((i) => i.productId);
    const products   = await Product.find({ _id: { $in: productIds } });

    const orderItems = items.map((i) => {
      const product = products.find((p) => p._id.toString() === i.productId);
      if (!product) throw new Error(`Product not found: ${i.productId}`);
      return { name: product.name, quantity: i.quantity, price: product.price, images: product.images };
    });

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalPrice,
      shippingAddress: {
        name:       shippingAddress.name,
        email:      shippingAddress.email,
        phone:      shippingAddress.phone,
        address:    shippingAddress.address,
        city:       shippingAddress.city,
        postalCode: shippingAddress.postalCode,
      },
      status: "pending",
    });

    // Send notifications in background — don't block the response
    Promise.allSettled([
      EmailService.sendOrderNotification(order),
      TelegramService.sendOrderNotification(order),
    ]);

    res.status(201).json({ message: "Order placed successfully", orderId: order._id });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── My Orders ───────────────────────────────────────────────────────────────

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── All Orders (Admin) ───────────────────────────────────────────────────────

const getAllOrders = async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── Update Status (Admin) ────────────────────────────────────────────────────

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["pending", "processing", "completed", "cancelled"];

    if (!valid.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order status updated", order });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };