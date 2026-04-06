const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },

    bookingType: {
      type: String,
      enum: ["hourly", "daily", "weekly", "package"],
      required: true,
    },

    selectedPackage: {
      label: { type: String },
      price: { type: Number },
      durationDays: { type: Number },
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    totalHours: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    payment: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      paidAt: { type: Date },
    },

    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },

    dropLocation: {
      type: String,
      trim: true,
    },

    cancellationReason: {
      type: String,
      trim: true,
    },

    cancelledAt: {
      type: Date,
    },

    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
