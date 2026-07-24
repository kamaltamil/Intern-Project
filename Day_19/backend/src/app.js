const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const helmet = require("helmet");
const { globalLimiter } = require("./config/rateLimitConfig");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const notFoundMiddleware = require("./middleware/notFoundMiddleware");

const app = express();

// Apply security headers, CORS policy, and global rate limiting
app.use(helmet());
app.use(cors(
  { origin: process.env.CORS_ORIGIN || "*" }
));
app.use(globalLimiter);

app.use(express.json());
app.use(morgan("dev"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Task Manager Backend Running",
  });
});

app.use(notFoundMiddleware);

module.exports = app;