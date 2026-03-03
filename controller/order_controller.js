const asyncHandler = require("../middleware/async");
const Order = require("../models/order_model");

// @desc    Submit rating for an order
// @route   POST /orders/:orderId/rating
// @access  Private
exports.submitRating = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { rating, review } = req.body;

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5",
    });
  }

  // Check if order exists
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Check if order belongs to the current user
  if (order.customerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to rate this order",
    });
  }

  // Check if order can be rated (must be delivered)
  if (order.orderStatus !== "delivered") {
    return res.status(400).json({
      success: false,
      message: "Only delivered orders can be rated",
    });
  }

  // Check if already rated
  if (order.rating.score) {
    return res.status(400).json({
      success: false,
      message: "This order has already been rated",
    });
  }

  // Update rating
  order.rating.score = rating;
  order.rating.review = review || "";
  order.rating.ratedAt = new Date();

  await order.save();

  res.status(200).json({
    success: true,
    message: "Rating submitted successfully",
    data: order,
  });
});

// @desc    Get order rating
// @route   GET /orders/:orderId/rating
// @access  Public
exports.getRating = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (!order.rating.score) {
    return res.status(404).json({
      success: false,
      message: "This order has not been rated yet",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      orderId: order._id,
      rating: order.rating.score,
      review: order.rating.review,
      ratedAt: order.rating.ratedAt,
    },
  });
});

// @desc    Get all orders
// @route   GET /orders
// @access  Private
exports.getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments({ customerId: req.user._id });
  const orders = await Order.find({ customerId: req.user._id })
    .populate("items.itemId", "itemName price")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: orders,
  });
});

// @desc    Get order by ID
// @route   GET /orders/:orderId
// @access  Private
exports.getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate("items.itemId", "itemName price image");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Check if order belongs to the current user
  if (order.customerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to view this order",
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});
