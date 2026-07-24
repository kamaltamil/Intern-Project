const { body, param } = require("express-validator");

const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters")
    .escape(),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email or username is required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

const validateRefresh = [
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required")
    .isString()
    .withMessage("Refresh token must be a string"),
];

const validateUpdateUser = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters")
    .escape(),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("role")
    .optional()
    .isIn(["Member", "Admin"])
    .withMessage("Role must be either Member or Admin"),
];

const validateUserId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid user ID format"),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateRefresh,
  validateUpdateUser,
  validateUserId,
};
