const asyncHandler = require("../middleware/async");
const Coupon = require("../models/coupon_model");

// @desc    Validate coupon and calculate discount
// @route   POST /coupons/validate
// @access  Public
exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;

  // Validate input
  if (!code || !amount) {
    return res.status(400).json({
      success: false,
      message: "Code and amount are required",
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be greater than 0",
    });
  }

  // Find coupon
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Invalid coupon code",
    });
  }

  // Check if coupon is active
  if (!coupon.isActive) {
    return res.status(400).json({
      success: false,
      message: "Coupon is not active",
    });
  }

  // Check expiry date
  if (coupon.expiryDate && new Date() > coupon.expiryDate) {
    return res.status(400).json({
      success: false,
      message: "Coupon has expired",
    });
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return res.status(400).json({
      success: false,
      message: "Coupon usage limit exceeded",
    });
  }

  // Check minimum order amount
  if (amount < coupon.minOrderAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount of ${coupon.minOrderAmount} required for this coupon`,
    });
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (amount * coupon.discountValue) / 100;
  } else if (coupon.discountType === "fixed") {
    discount = coupon.discountValue;
  }

  // Apply max discount limit if set
  if (coupon.maxDiscount && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }

  // Calculate final amount
  const finalAmount = amount - discount;

  res.status(200).json({
    success: true,
    message: "Coupon is valid",
    data: {
      couponCode: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      originalAmount: amount,
      discountAmount: Math.round(discount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100,
      maxDiscount: coupon.maxDiscount,
    },
  });
});

// @desc    Get all active coupons
// @route   GET /coupons
// @access  Public
exports.getAllCoupons = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = {
    isActive: true,
    $or: [
      { expiryDate: { $gt: new Date() } },
      { expiryDate: null },
    ],
  };

  const total = await Coupon.countDocuments(query);
  const coupons = await Coupon.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: coupons.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: coupons,
  });
});

// @desc    Get coupon by code
// @route   GET /coupons/:code
// @access  Public
exports.getCouponByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Coupon not found",
    });
  }

  res.status(200).json({
    success: true,
    data: coupon,
  });
});
