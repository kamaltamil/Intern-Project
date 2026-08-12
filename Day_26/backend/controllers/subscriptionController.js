const Subscription = require("../models/subscription");
const { sendSubscriptionConfirmation } = require("../services/emailService");

const subscribe = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (await Subscription.findOne({ email })) {
      return res.status(409).json({ message: "This email is already subscribed" });
    }

    await Subscription.create({ email });

    try {
      await sendSubscriptionConfirmation(email);
    } catch (error) {
      console.error("Subscription email failed:", error.message);
      return res.status(502).json({
        message: "Subscription saved, but the confirmation email could not be sent",
      });
    }

    return res.status(201).json({
      message: "Subscription successful. Confirmation email sent.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This email is already subscribed" });
    }

    return res.status(500).json({ message: "Unable to process subscription" });
  }
};

module.exports = { subscribe };
