const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
    student: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'Student', 
        required: true 
    },
    course: {
        type: String,
        enum: ['MSC', 'BSC', 'CSE', 'IT', 'MCA', 'BCA', 'Other'],
        required: true
    },
    cgpa: { 
        type: Number, 
        required: true,
        min: 0,
        max: 10
    },
    grade: { 
        type: String, 
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Mark', markSchema);