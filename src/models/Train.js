const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema(
  {
    trainNumber: {
      type: String,
      required: [true, "Train number is required"],
      unique: true,
      trim: true,
    },
    trainName: {
      type: String,
      required: [true, "Train name is required"],
      trim: true,
    },
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: [true, "Source station is required"],
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: [true, "Destination station is required"],
    },
    departureTime: {
      type: String,
      required: [true, "Departure time is required"],
    },
    arrivalTime: {
      type: String,
      required: [true, "Arrival time is required"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    daysOfOperation: [
      {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        required: true,
      },
    ],
    classes: [
      {
        classType: {
          type: String,
          enum: ["SL", "3A", "2A", "1A", "CC", "EC"],
          required: true,
        },
        totalSeats: {
          type: Number,
          required: true,
        },
        farePerKm: {
          type: Number,
          required: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
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

// Indexes
trainSchema.index({ source: 1, destination: 1 });
trainSchema.index({ trainNumber: 1 });
trainSchema.index({ isActive: 1 });

module.exports = mongoose.model("Train", trainSchema);
