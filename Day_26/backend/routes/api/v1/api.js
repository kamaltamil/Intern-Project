const express = require('express');
const router = express.Router();

const usersRouter = require('./users');
const booking = require('./booking');
const rooms = require('./rooms');
const roles = require('./roles');

const { authenticateToken } = require('../../../middleware/auth');
const { rateLimiter } = require('../../../config/rateLimiting')

router.use('/users', usersRouter);
router.use('/booking', rateLimiter, authenticateToken, booking);
router.use('/rooms', authenticateToken, rooms);
router.use('/roles', authenticateToken, roles);

module.exports = router;
