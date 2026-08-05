const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    roomStatus: {
        type: String,
        required: true,
        enum: ["Available", "Occupied", "Maintenance"],
        default: "Available"
    },
    bookingStatus: {
        type: String,
        required: [true, "Booking status is required"],
        enum: ["Payment Pending", "Booked", "CheckedIn", "CheckedOut", "Cancelled"],
        default: "Payment Pending"
    }
})

module.exports = mongoose.model("Booking", bookingSchema);