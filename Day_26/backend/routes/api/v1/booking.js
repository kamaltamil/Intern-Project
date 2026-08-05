const express = require('express');
const router = express.Router();

const {
    bookRoom,
    getBookings
} = require('../../../controllers/bookingController')

const {
    authenticateToken
} = require('../../../middleware/auth')

router.get('/', authenticateToken, getBookings)
router.post('/new', authenticateToken, bookRoom)

module.exports = router;