const { body } = require("express-validator");
const { emailPattern } = require("./patterns");

// Validate the email submitted for a newsletter subscription.
const subscriptionPayload = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .matches(emailPattern)
    .withMessage("Please enter a valid email address"),
];

module.exports = { subscriptionPayload };
