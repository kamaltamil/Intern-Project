const Subscription = require("../models/subscription");

const { sendSubscriptionConfirmation } = require("../services/emailService");

const {
  created,
  badRequest,
  conflict,
  badGateway,
  internalServerError,
} = require("../utils/response");

// Validates a newsletter subscription, stores the email, and sends confirmation.
const subscribe = async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest(res, "Please enter a valid email address");
    }

    if (await Subscription.findOne({ email })) {
      return conflict(res, "This email is already subscribed");
    }

    await Subscription.create({ email });

    try {
      await sendSubscriptionConfirmation(email);
    } catch (error) {
      console.error("Subscription email failed:", error.message);

      return badGateway(
        res,
        "Subscription saved, but the confirmation email could not be sent",
      );
    }

    return created(res, "Subscription successful. Confirmation email sent.");
  } catch (error) {
    if (error.code === 11000) {
      return conflict(res, "This email is already subscribed");
    }

    return internalServerError(res, "Unable to process subscription");
  }
};

module.exports = { subscribe };
