const mongoose = require('mongoose');

// Stores the room, guest, dates, and current state for each booking.
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
    // Tracks the booking workflow from approval through completion or cancellation.
    bookingStatus: {
        type: String,
        required: [true, "Booking status is required"],
        enum: [
            "Pending Approval",
            "Rejected",
            "Payment Pending",
            "Booked",
            "CheckedIn",
            "CheckedOut",
            "Cancelled"
        ],
        default: "Pending Approval"
    }
});

module.exports = mongoose.model("Booking", bookingSchema);