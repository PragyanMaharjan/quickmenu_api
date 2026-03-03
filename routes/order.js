const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const {
  submitRating,
  getRating,
  getAllOrders,
  getOrderById,
} = require("../controller/order_controller");

// Rating routes
router.post("/:orderId/rating", protect, submitRating);
router.get("/:orderId/rating", getRating);

// Order routes
router.get("/", protect, getAllOrders);
router.get("/:orderId", protect, getOrderById);

module.exports = router;
