const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema(
  {
    stationCode: {
      type: String,
      required: [true, "Station code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    stationName: {
      type: String,
      required: [true, "Station name is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^[0-9]{6}$/, "Please enter a valid 6-digit pincode"],
    },
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
stationSchema.index({ stationCode: 1 });
stationSchema.index({ city: 1 });
stationSchema.index({ state: 1 });
stationSchema.index({ isActive: 1 });

module.exports = mongoose.model("Station", stationSchema);

// Example Station Objects:
/*
// Source Station (Delhi)
{
  stationCode: "DEL",
  stationName: "New Delhi Railway Station",
  city: "Delhi",
  state: "Delhi",
  pincode: "110002",
  isActive: true
}

// Destination Station (Mumbai)
{
  stationCode: "CSTM",
  stationName: "Chhatrapati Shivaji Maharaj Terminus",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  isActive: true
}
*/
