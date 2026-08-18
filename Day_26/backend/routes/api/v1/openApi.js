const express = require("express");

const router = express.Router();

const {
  register,
  login,
  refresh,
} = require("../../../controllers/authController");

const { subscribe } = require("../../../controllers/subscriptionController");
const { validateRequest } = require("../../../middleware/validationHandler");
const { signupPayload, loginPayload } = require("../../../validators/authValidator");
const { subscriptionPayload } = require("../../../validators/subscriptionValidator");
const { rateLimiter } = require("../../../config/rateLimiting");

router.post("/signup", signupPayload, validateRequest, register);
router.post("/login", loginPayload, validateRequest, login);
router.post("/refresh", refresh);

router.use("/subscriptions", rateLimiter, subscriptionPayload, validateRequest, subscribe);

module.exports = router;
