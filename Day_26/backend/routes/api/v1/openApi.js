const express = require("express");

const router = express.Router();

const {
  register,
  login,
  refresh,
} = require("../../../controllers/authController");

const { subscribe } = require("../../../controllers/subscriptionController");

const { rateLimiter } = require("../../../config/rateLimiting");

router.post("/signup", register);
router.post("/login", login);
router.post("/refresh", refresh);

router.use("/subscriptions", rateLimiter, subscribe);

module.exports = router