/**
 * Centralized Express error-handling middleware.
 *
 * Any controller that calls next(err) will be caught here.
 * Keeps individual route handlers free of repetitive try/catch boilerplate.
 *
 * Must be registered AFTER all routes in app.js (four-argument signature is required by Express).
 */
const errorMiddleware = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;
