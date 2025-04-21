const express = require("express");
const { body, param, query } = require("express-validator");
const bookingController = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

// Validation middleware
const bookTicketValidation = [
  body("trainId").isMongoId().withMessage("Invalid train ID"),
  body("journeyDate").isISO8601().withMessage("Invalid journey date"),
  body("source").isMongoId().withMessage("Invalid source station ID"),
  body("destination").isMongoId().withMessage("Invalid destination station ID"),
  body("passengers").isArray().withMessage("Passengers must be an array"),
  body("passengers.*.name")
    .notEmpty()
    .withMessage("Passenger name is required"),
  body("passengers.*.age")
    .isInt({ min: 1 })
    .withMessage("Invalid passenger age"),
  body("passengers.*.gender")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Invalid gender"),
  body("passengers.*.berthPreference")
    .optional()
    .isIn([
      "Lower",
      "Middle",
      "Upper",
      "Side Lower",
      "Side Upper",
      "No Preference",
    ])
    .withMessage("Invalid berth preference"),
  body("classType")
    .isIn(["SL", "3A", "2A", "1A", "CC", "EC"])
    .withMessage("Invalid class type"),
];

const bookingHistoryValidation = [
  query("status")
    .optional()
    .isIn(["Booked", "Cancelled"])
    .withMessage("Invalid booking status"),
  query("startDate").optional().isISO8601().withMessage("Invalid start date"),
  query("endDate").optional().isISO8601().withMessage("Invalid end date"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
];

// Routes
router.post(
  "/",
  protect,
  bookTicketValidation,
  validateRequest,
  bookingController.bookTicket
);

router.post(
  "/cancel/:bookingId",
  protect,
  param("bookingId").isMongoId().withMessage("Invalid booking ID"),
  validateRequest,
  bookingController.cancelTicket
);

router.get(
  "/history",
  protect,
  bookingHistoryValidation,
  validateRequest,
  bookingController.getBookingHistory
);

router.get(
  "/pnr/:pnr",
  protect,
  param("pnr").notEmpty().withMessage("PNR is required"),
  validateRequest,
  bookingController.getBookingByPNR
);

// Admin routes
router.get(
  "/admin/bookings",
  protect,
  authorize("admin"),
  bookingHistoryValidation,
  validateRequest,
  bookingController.getBookingHistory
);

module.exports = router;
