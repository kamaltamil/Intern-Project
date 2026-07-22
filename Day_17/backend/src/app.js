const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const notFoundMiddleware = require("./middleware/notFoundMiddleware");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Task Manager Backend Running",
  });
});

// 404 Middleware
app.use(notFoundMiddleware);

module.exports = app;