const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const helmet = require("helmet");
const { globalLimiter } = require("./config/rateLimitConfig");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const notFoundMiddleware = require("./middleware/notFoundMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(globalLimiter);

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Task Manager Backend Running" });
});

// Serve uploaded files with cross-origin policy so the frontend (port 3000)
// can load images from the backend (port 8080).
// Helmet sets Cross-Origin-Resource-Policy: same-origin globally, which blocks
// cross-origin <img> loads — we override it only for this static route.
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static("public/uploads"));

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;