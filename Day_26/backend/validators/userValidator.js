const { body, param } = require("express-validator");
const {
  namePattern,
  usernamePattern,
  emailPattern,
  passwordPattern,
} = require("./patterns");

// Validate the fields accepted when an administrator creates a user.
const createUserPayload = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .matches(namePattern)
    .withMessage("Invalid name"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .matches(emailPattern)
    .withMessage("Please enter a valid email address"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .matches(usernamePattern)
    .withMessage("Invalid username"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(passwordPattern)
    .withMessage("Invalid password"),
  body("role").notEmpty().withMessage("Role is required"),
];

// Validate only fields supplied when an existing user is updated.
const updateUserPayload = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("name")
    .optional()
    .trim()
    .matches(namePattern)
    .withMessage("Invalid name"),
  body("email")
    .optional()
    .trim()
    .matches(emailPattern)
    .withMessage("Please enter a valid email address"),
  body("username")
    .optional()
    .trim()
    .matches(usernamePattern)
    .withMessage("Invalid username"),
  body("password")
    .optional({ values: "falsy" })
    .matches(passwordPattern)
    .withMessage("Invalid password"),
  body("role").optional().notEmpty().withMessage("Role cannot be empty"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

module.exports = { createUserPayload, updateUserPayload };
