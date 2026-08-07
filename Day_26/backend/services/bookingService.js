const Room = require('../models/rooms');
const Booking = require('../models/booking');
const User = require('../models/users');


const varifyAndBookRoom = async ({ roomId, userId, startDate, endDate }) => {

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
        throw new Error('Invalid date range');
    }

    const room = await Room.findById(roomId);
    if (!room) {
        throw new Error('Room not found');
    }

    const roomIsBooked = await Booking.findOne({
        room: roomId,
        bookingStatus: { $in: ['Booked', 'CheckedIn'] },
        startDate: { $lt: end },
        endDate: { $gt: start }
    });

    if (roomIsBooked) {
        throw new Error('Room is already booked');
    }

    const booking = await Booking.create({
        room: roomId,
        user: userId,
        startDate: startDate,
        endDate : endDate,
        roomStatus: 'Occupied',
        bookingStatus: 'Payment Pending',
    })
    return booking;
}


const getAllBookings = async () => {
    try {
        const bookings = await Booking.find().populate('room');
        return bookings;
    } catch (error) {
        throw new Error('Error fetching bookings: ' + error.message);
    }
}
const getMemberBookings = async () => {
    try {
        // Booking doesn't store the booker's role directly, so resolve it
        // via the users who currently have the 'Member' role.
        const memberIds = await User.find({ role: 'Member' }).distinct('_id');
        const bookings = await Booking.find({ user: { $in: memberIds } }).populate('room');
        return bookings;
    } catch (error) {
        throw new Error('Error fetching bookings: ' + error.message);
    }
}
const getBookingsByUserId = async (userId) => {
    try {
        const bookings = await Booking.find({ user: userId }).populate('room');
        return bookings;
    } catch (error) {
        throw new Error('Error fetching bookings: ' + error.message);
    }
}
module.exports = {
    varifyAndBookRoom,
    getAllBookings,
    getMemberBookings,
    getBookingsByUserId
}