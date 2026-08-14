const createError = require('http-errors');
const express = require('express');
const path = require('node:path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();

const apiv1Router = require('./routes/api/v1/api');

// Hide the framework header so the server does not expose Express details.
app.disable('x-powered-by');

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
};

app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Prevent browser caching of dynamic API responses backed by the database.
app.use('/api/v1', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Mount all version 1 API routes under the common API prefix.
app.use('/api/v1', apiv1Router);

// Forward unmatched requests to the error handler as HTTP 404 responses.
app.use(function(req, res, next) {
  next(createError(404));
});

// Return API-friendly error responses while exposing details only in development.
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;