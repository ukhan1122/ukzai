const express                                                        = require("express");
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus }  = require("../controllers/orderController");
const { authMiddleware, adminMiddleware }                            = require("../middleware/auth");

const router = express.Router();

// User routes
router.post("/create",   authMiddleware, createOrder);
router.get("/myorders",  authMiddleware, getMyOrders);

// Admin routes
router.get("/",          authMiddleware, adminMiddleware, getAllOrders);
router.put("/:id",       authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;