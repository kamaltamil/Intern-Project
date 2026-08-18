const { body } = require("express-validator");
const {
  namePattern,
  usernamePattern,
  emailPattern,
  passwordPattern,
} = require("./patterns");

// Validate the fields used by signup and login requests.
const signupPayload = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .matches(namePattern)
    .withMessage("Name must contain at least two words with at least 2 letters each"),
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
    .withMessage("Username must be 3-16 characters and contain only letters, numbers, or underscores"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(passwordPattern)
    .withMessage("Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character"),
];

const loginPayload = [
  body("identifier").trim().notEmpty().withMessage("Identifier is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = { signupPayload, loginPayload };
