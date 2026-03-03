const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const {
  esewaCallback,
  khaltiCallback,
  getPaymentStatus,
} = require("../controller/payment_controller");

// Payment callback routes (no authentication needed for callbacks)
router.post("/esewa/callback", esewaCallback);
router.post("/khalti/callback", khaltiCallback);

// Payment status route
router.get("/status/:orderId", protect, getPaymentStatus);

module.exports = router;
