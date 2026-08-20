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


router.post("/signup", 
  /*
    #swagger.tags = ['OpenApi']
  */
  signupPayload, validateRequest, register);

router.post("/login", 
  /*
    #swagger.tags = ['OpenApi']
  */
    loginPayload, validateRequest, login);

router.post("/refresh", 
  /*
    #swagger.tags = ['OpenApi']
  */
  refresh);
 
router.post("/subscriptions", 
  /*
    #swagger.tags = ['OpenApi']
  */ 
  rateLimiter, subscriptionPayload, validateRequest, subscribe);

module.exports = router;
