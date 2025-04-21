const express = require("express");
const { body, param, query } = require("express-validator");
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

// Validation middleware
const updateProfileValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name is required"),
  body("email").optional().isEmail().withMessage("Please enter a valid email"),
  body("phone")
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage("Please enter a valid 10-digit phone number"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

const updateUserStatusValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID"),
  body("isActive").isBoolean().withMessage("isActive must be a boolean"),
];

const updateUserRoleValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID"),
  body("role").isIn(["user", "admin", "agent"]).withMessage("Invalid role"),
];

const getAllUsersValidation = [
  query("role")
    .optional()
    .isIn(["user", "admin", "agent"])
    .withMessage("Invalid role"),
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

// User routes
router.get("/profile", protect, userController.getProfile);

router.put(
  "/profile",
  protect,
  updateProfileValidation,
  validateRequest,
  userController.updateProfile
);

router.put(
  "/change-password",
  protect,
  changePasswordValidation,
  validateRequest,
  userController.changePassword
);

// Admin routes
router.get(
  "/admin/users",
  protect,
  authorize("admin"),
  getAllUsersValidation,
  validateRequest,
  userController.getAllUsers
);

router.put(
  "/admin/users/:userId/status",
  protect,
  authorize("admin"),
  updateUserStatusValidation,
  validateRequest,
  userController.updateUserStatus
);

router.put(
  "/admin/users/:userId/role",
  protect,
  authorize("admin"),
  updateUserRoleValidation,
  validateRequest,
  userController.updateUserRole
);

module.exports = router;
