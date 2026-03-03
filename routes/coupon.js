const express = require("express");
const router = express.Router();

const {
  validateCoupon,
  getAllCoupons,
  getCouponByCode,
} = require("../controller/coupon_controller");

// Coupon routes
router.post("/validate", validateCoupon);
router.get("/", getAllCoupons);
router.get("/:code", getCouponByCode);

module.exports = router;
