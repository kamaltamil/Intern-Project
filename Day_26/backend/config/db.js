const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
  try {
    logger.debug("Attempting MongoDB connection", {
      uri: process.env.MONGO_URI,
    });

    await mongoose.connect(process.env.MONGO_URI);

    logger.info("MongoDB connected", {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  } catch (error) {
    logger.error("MongoDB connection failed", {
      message: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};

module.exports = connectDB;