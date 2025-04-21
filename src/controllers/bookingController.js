const Booking = require("../models/Booking");
const Train = require("../models/Train");
const { validationResult } = require("express-validator");

exports.bookTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { trainId, journeyDate, source, destination, passengers, classType } =
      req.body;

    // Get train details
    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({
        success: false,
        message: "Train not found",
      });
    }

    // Get class details
    const classDetails = train.classes.find((c) => c.classType === classType);
    if (!classDetails) {
      return res.status(400).json({
        success: false,
        message: "Invalid class type",
      });
    }

    // TODO: Implement actual seat availability check
    // This is a placeholder - in real implementation, you would:
    // 1. Check if seats are available
    // 2. Handle RAC and waiting list
    // 3. Calculate fare based on distance and class

    // Calculate total fare (placeholder)
    const totalFare = passengers.length * classDetails.farePerKm * 100; // Assuming 100km distance

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      train: trainId,
      journeyDate,
      source,
      destination,
      passengers,
      class: classType,
      totalFare,
      status: "Confirmed", // Placeholder - should be based on availability
      bookingStatus: "Booked",
      paymentStatus: "Completed", // Placeholder - should be based on actual payment
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error booking ticket",
      error: error.message,
    });
  }
};

exports.cancelTicket = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is authorized to cancel
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Check if booking can be cancelled
    const journeyDate = new Date(booking.journeyDate);
    const currentDate = new Date();
    const hoursDiff = (journeyDate - currentDate) / (1000 * 60 * 60);

    if (hoursDiff < 4) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel ticket less than 4 hours before journey",
      });
    }

    // Calculate refund amount (placeholder)
    const refundAmount = booking.totalFare * 0.5; // 50% refund

    // Update booking
    booking.bookingStatus = "Cancelled";
    booking.paymentStatus = "Refunded";
    booking.cancellationDate = new Date();
    booking.refundAmount = refundAmount;
    await booking.save();

    res.json({
      success: true,
      message: "Ticket cancelled successfully",
      data: {
        refundAmount,
        cancellationDate: booking.cancellationDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling ticket",
      error: error.message,
    });
  }
};

exports.getBookingHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { user: req.user._id };
    if (req.query.status) {
      query.bookingStatus = req.query.status;
    }
    if (req.query.startDate && req.query.endDate) {
      query.journeyDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    // Get total count for pagination
    const total = await Booking.countDocuments(query);

    // Get bookings with cursor-based pagination
    const bookings = await Booking.find(query)
      .populate("train", "trainNumber trainName")
      .populate("source", "stationCode stationName")
      .populate("destination", "stationCode stationName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booking history",
      error: error.message,
    });
  }
};

exports.getBookingByPNR = async (req, res) => {
  try {
    const { pnr } = req.params;

    const booking = await Booking.findOne({ pnr })
      .populate("train", "trainNumber trainName")
      .populate("source", "stationCode stationName")
      .populate("destination", "stationCode stationName");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is authorized to view
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};
