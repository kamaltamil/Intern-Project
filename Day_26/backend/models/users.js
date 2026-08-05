const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        length: 50,
        match: [ /^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 1024
    },
    refreshToken: {
        type: String,
        default: null
    },
    role: {
        type: String,
        default: "Member"
    }
})

module.exports = mongoose.model("User", userSchema);