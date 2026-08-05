const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true,
        minlength: 1,
        maxlength: 10
    },
    type: {
        type: String,
        required: true,
        enum: ["Single", "Double", "Suite"]
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
})

module.exports = mongoose.model("Room", roomSchema);