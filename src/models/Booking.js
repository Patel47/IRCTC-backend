const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    pnr: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    journeyDate: {
      type: Date,
      required: true,
    },
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    passengers: [
      {
        name: {
          type: String,
          required: true,
        },
        age: {
          type: Number,
          required: true,
        },
        gender: {
          type: String,
          enum: ["Male", "Female", "Other"],
          required: true,
        },
        berthPreference: {
          type: String,
          enum: [
            "Lower",
            "Middle",
            "Upper",
            "Side Lower",
            "Side Upper",
            "No Preference",
          ],
          default: "No Preference",
        },
      },
    ],
    class: {
      type: String,
      enum: ["SL", "3A", "2A", "1A", "CC", "EC"],
      required: true,
    },
    totalFare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Confirmed", "RAC", "Waiting", "Cancelled"],
      default: "Waiting",
    },
    bookingStatus: {
      type: String,
      enum: ["Booked", "Cancelled"],
      default: "Booked",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentId: {
      type: String,
    },
    cancellationDate: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Generate PNR before saving
bookingSchema.pre("save", function (next) {
  if (!this.pnr) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.pnr = `${timestamp.slice(-6)}${random}`;
  }
  next();
});

// Indexes
bookingSchema.index({ pnr: 1 });
bookingSchema.index({ user: 1 });
bookingSchema.index({ train: 1 });
bookingSchema.index({ journeyDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
