const Station = require("../models/Station");
const { validationResult } = require("express-validator");

exports.createStation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const station = await Station.create(req.body);

    res.status(201).json({
      success: true,
      data: station,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating station",
      error: error.message,
    });
  }
};

exports.updateStation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    res.json({
      success: true,
      data: station,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating station",
      error: error.message,
    });
  }
};

exports.deleteStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    res.json({
      success: true,
      message: "Station deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting station",
      error: error.message,
    });
  }
};

exports.getStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    res.json({
      success: true,
      data: station,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching station",
      error: error.message,
    });
  }
};

exports.getAllStations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (req.query.city) {
      query.city = new RegExp(req.query.city, "i");
    }
    if (req.query.state) {
      query.state = new RegExp(req.query.state, "i");
    }
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === "true";
    }

    // Get total count for pagination
    const total = await Station.countDocuments(query);

    // Get stations with cursor-based pagination
    const stations = await Station.find(query)
      .sort({ stationName: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: stations,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stations",
      error: error.message,
    });
  }
};

exports.searchStations = async (req, res) => {
  try {
    const { query } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const stations = await Station.find({
      $or: [
        { stationName: new RegExp(query, "i") },
        { stationCode: new RegExp(query, "i") },
        { city: new RegExp(query, "i") },
      ],
      isActive: true,
    })
      .select("stationCode stationName city state")
      .limit(limit);

    res.json({
      success: true,
      data: stations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching stations",
      error: error.message,
    });
  }
};
