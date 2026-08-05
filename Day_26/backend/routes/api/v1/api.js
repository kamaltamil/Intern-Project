const express = require('express');
const router = express.Router();

const usersRouter = require('./users');
const booking = require('./booking');
const rooms = require('./rooms');
const roles = require('./roles');

router.use('/users', usersRouter);
router.use('/booking', booking);
router.use('/rooms', rooms);
router.use('/roles', roles);

module.exports = router;