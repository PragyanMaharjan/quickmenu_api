const asyncHandler = require("../middleware/async");
const Order = require("../models/order_model");
const crypto = require("crypto");

// @desc    Handle eSewa payment callback
// @route   POST /payments/esewa/callback
// @access  Public
exports.esewaCallback = asyncHandler(async (req, res) => {
  const { pidx, status, transaction_id } = req.query;

  // Validate eSewa response
  if (!pidx || !status || !transaction_id) {
    return res.status(400).json({
      success: false,
      message: "Invalid callback parameters",
    });
  }

  try {
    // Find order by transaction ID
    // pidx usually contains the order ID in the format: orderId_timestamp
    const orderId = pidx.split("_")[0];
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check payment status
    if (status === "COMPLETED" || status === "success") {
      order.paymentStatus = "completed";
      order.orderStatus = "confirmed";
      order.transactionId.esewa = transaction_id;
      await order.save();

      return res.status(200).json({
        success: true,
        message: "Payment successful",
        data: {
          orderId: order._id,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          transactionId: transaction_id,
        },
      });
    } else {
      order.paymentStatus = "failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment failed",
        data: {
          orderId: order._id,
          paymentStatus: order.paymentStatus,
        },
      });
    }
  } catch (error) {
    console.error("eSewa callback error:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing payment callback",
      error: error.message,
    });
  }
});

// @desc    Handle Khalti payment callback
// @route   POST /payments/khalti/callback
// @access  Public
exports.khaltiCallback = asyncHandler(async (req, res) => {
  const { pidx, transaction_id, status, token } = req.body;

  // Validate Khalti response
  if (!pidx || !transaction_id || !status) {
    return res.status(400).json({
      success: false,
      message: "Invalid callback parameters",
    });
  }

  try {
    // Find order by transaction ID
    // pidx usually contains the order ID in the format: orderId_timestamp
    const orderId = pidx.split("_")[0];
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check payment status
    if (status === "Completed" || status === "COMPLETED" || status === "completed") {
      order.paymentStatus = "completed";
      order.orderStatus = "confirmed";
      order.transactionId.khalti = transaction_id;
      await order.save();

      return res.status(200).json({
        success: true,
        message: "Payment successful",
        data: {
          orderId: order._id,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          transactionId: transaction_id,
        },
      });
    } else {
      order.paymentStatus = "failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment failed",
        data: {
          orderId: order._id,
          paymentStatus: order.paymentStatus,
        },
      });
    }
  } catch (error) {
    console.error("Khalti callback error:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing payment callback",
      error: error.message,
    });
  }
});

// @desc    Get payment status
// @route   GET /payments/status/:orderId
// @access  Private
exports.getPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      transactionIds: order.transactionId,
    },
  });
});
