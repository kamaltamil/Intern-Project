const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mail: { type: String, required: true, unique: true, trim: true, lowercase: true },
  age: { type: Number, required: true, min: 1 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);