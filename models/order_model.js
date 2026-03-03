const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "esewa", "khalti", "credit_card"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "preparing", "ready", "delivered", "cancelled"],
      default: "placed",
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      review: {
        type: String,
        default: null,
      },
      ratedAt: {
        type: Date,
        default: null,
      },
    },
    transactionId: {
      esewa: {
        type: String,
        default: null,
      },
      khalti: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
