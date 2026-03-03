const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["available", "claimed", "resolved"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for faster queries
itemSchema.index({ type: 1 });
itemSchema.index({ status: 1 });
itemSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Item", itemSchema);
