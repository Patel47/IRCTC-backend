const express = require("express");
const { body, param, query } = require("express-validator");
const stationController = require("../controllers/stationController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

// Validation middleware
const createStationValidation = [
  body("stationCode").notEmpty().withMessage("Station code is required"),
  body("stationName").notEmpty().withMessage("Station name is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("state").notEmpty().withMessage("State is required"),
  body("pincode")
    .matches(/^[0-9]{6}$/)
    .withMessage("Please enter a valid 6-digit pincode"),
];

const updateStationValidation = [
  param("id").isMongoId().withMessage("Invalid station ID"),
  ...createStationValidation,
];

const getAllStationsValidation = [
  query("city").optional().trim(),
  query("state").optional().trim(),
  query("isActive")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isActive must be true or false"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
];

const searchStationsValidation = [
  query("query").notEmpty().withMessage("Search query is required"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
];

// Routes
router.post(
  "/",
  protect,
  authorize("admin"),
  createStationValidation,
  validateRequest,
  stationController.createStation
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateStationValidation,
  validateRequest,
  stationController.updateStation
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  param("id").isMongoId().withMessage("Invalid station ID"),
  validateRequest,
  stationController.deleteStation
);

router.get(
  "/:id",
  protect,
  param("id").isMongoId().withMessage("Invalid station ID"),
  validateRequest,
  stationController.getStation
);

router.get(
  "/",
  protect,
  getAllStationsValidation,
  validateRequest,
  stationController.getAllStations
);

router.get(
  "/search",
  protect,
  searchStationsValidation,
  validateRequest,
  stationController.searchStations
);

module.exports = router;
