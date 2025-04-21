const express = require("express");
const { body, param, query } = require("express-validator");
const trainController = require("../controllers/trainController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

// Validation middleware
const createTrainValidation = [
  body("trainNumber").notEmpty().withMessage("Train number is required"),
  body("trainName").notEmpty().withMessage("Train name is required"),
  body("source").isMongoId().withMessage("Invalid source station ID"),
  body("destination").isMongoId().withMessage("Invalid destination station ID"),
  body("departureTime").notEmpty().withMessage("Departure time is required"),
  body("arrivalTime").notEmpty().withMessage("Arrival time is required"),
  body("duration").notEmpty().withMessage("Duration is required"),
  body("daysOfOperation")
    .isArray()
    .withMessage("Days of operation must be an array"),
  body("classes").isArray().withMessage("Classes must be an array"),
  body("classes.*.classType")
    .isIn(["SL", "3A", "2A", "1A", "CC", "EC"])
    .withMessage("Invalid class type"),
  body("classes.*.totalSeats")
    .isInt({ min: 1 })
    .withMessage("Total seats must be a positive number"),
  body("classes.*.farePerKm")
    .isFloat({ min: 0 })
    .withMessage("Fare per km must be a positive number"),
];

const updateTrainValidation = [
  param("id").isMongoId().withMessage("Invalid train ID"),
  ...createTrainValidation,
];

const searchTrainsValidation = [
  query("source").isMongoId().withMessage("Invalid source station ID"),
  query("destination")
    .isMongoId()
    .withMessage("Invalid destination station ID"),
  query("date").isISO8601().withMessage("Invalid date format"),
  query("classType")
    .optional()
    .isIn(["SL", "3A", "2A", "1A", "CC", "EC"])
    .withMessage("Invalid class type"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
];

const trainAvailabilityValidation = [
  query("trainId").isMongoId().withMessage("Invalid train ID"),
  query("date").isISO8601().withMessage("Invalid date format"),
  query("classType")
    .isIn(["SL", "3A", "2A", "1A", "CC", "EC"])
    .withMessage("Invalid class type"),
];

// Routes
router.post(
  "/",
  protect,
  authorize("admin"),
  createTrainValidation,
  validateRequest,
  trainController.createTrain
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateTrainValidation,
  validateRequest,
  trainController.updateTrain
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  param("id").isMongoId().withMessage("Invalid train ID"),
  validateRequest,
  trainController.deleteTrain
);

router.get(
  "/:id",
  protect,
  param("id").isMongoId().withMessage("Invalid train ID"),
  validateRequest,
  trainController.getTrain
);

router.get(
  "/search",
  protect,
  searchTrainsValidation,
  validateRequest,
  trainController.searchTrains
);

router.get(
  "/availability",
  protect,
  trainAvailabilityValidation,
  validateRequest,
  trainController.getTrainAvailability
);

module.exports = router;
