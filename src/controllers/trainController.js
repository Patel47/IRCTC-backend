const Train = require("../models/Train");
const { validationResult } = require("express-validator");

exports.createTrain = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const train = await Train.create(req.body);

    res.status(201).json({
      success: true,
      data: train,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating train",
      error: error.message,
    });
  }
};

exports.updateTrain = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const train = await Train.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!train) {
      return res.status(404).json({
        success: false,
        message: "Train not found",
      });
    }

    res.json({
      success: true,
      data: train,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating train",
      error: error.message,
    });
  }
};

exports.deleteTrain = async (req, res) => {
  try {
    const train = await Train.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!train) {
      return res.status(404).json({
        success: false,
        message: "Train not found",
      });
    }

    res.json({
      success: true,
      message: "Train deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting train",
      error: error.message,
    });
  }
};

exports.getTrain = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id)
      .populate("source", "stationCode stationName city state")
      .populate("destination", "stationCode stationName city state");

    if (!train) {
      return res.status(404).json({
        success: false,
        message: "Train not found",
      });
    }

    res.json({
      success: true,
      data: train,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching train",
      error: error.message,
    });
  }
};

exports.searchTrains = async (req, res) => {
  try {
    const { source, destination, date, classType } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Convert date to day of week
    const journeyDate = new Date(date);
    const dayOfWeek = journeyDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Build query
    const query = {
      source,
      destination,
      isActive: true,
      daysOfOperation: dayOfWeek,
    };

    if (classType) {
      query["classes.classType"] = classType;
    }

    // Get total count for pagination
    const total = await Train.countDocuments(query);

    // Get trains with cursor-based pagination
    const trains = await Train.find(query)
      .populate("source", "stationCode stationName city state")
      .populate("destination", "stationCode stationName city state")
      .sort({ departureTime: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: trains,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching trains",
      error: error.message,
    });
  }
};

exports.getTrainAvailability = async (req, res) => {
  try {
    const { trainId, date, classType } = req.query;

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

    // TODO: Implement actual seat availability logic
    // This is a placeholder - in real implementation, you would:
    // 1. Query bookings for this train on this date
    // 2. Calculate available seats based on total seats and booked seats
    // 3. Consider RAC and waiting list

    const availability = {
      totalSeats: classDetails.totalSeats,
      availableSeats: Math.floor(classDetails.totalSeats * 0.8), // Placeholder
      racSeats: Math.floor(classDetails.totalSeats * 0.1), // Placeholder
      waitingList: Math.floor(classDetails.totalSeats * 0.1), // Placeholder
    };

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking train availability",
      error: error.message,
    });
  }
};
