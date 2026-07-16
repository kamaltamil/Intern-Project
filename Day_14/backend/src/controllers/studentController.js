const Student = require('../models/Student');
const Mark = require('../models/Mark');

exports.createStudent = async (req, res) => {
  try {
    const { name, mail, age } = req.body;

    if (!name || !mail || age === undefined || age === null) {
      return res.status(400).json({ message: 'Name, email, and age are required' });
    }

    const normalizedMail = String(mail).trim().toLowerCase();
    const existingStudent = await Student.findOne({ mail: normalizedMail });
    if (existingStudent) {
      return res.status(409).json({ message: 'Email already exists. Please use a different email.' });
    }

    const student = new Student({
      ...req.body,
      mail: normalizedMail,
      name: String(name).trim()
    });

    await student.save();
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already exists. Please use a different email.' });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 5 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const matchStage = {
      isDeleted: false,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { mail: { $regex: search, $options: 'i' } }
      ]
    };

    const totalCount = await Student.countDocuments(matchStage);

    const students = await Student.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'marks',
          localField: '_id',
          foreignField: 'student',
          as: 'academicMarks'
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({ students, totalCount, page: parseInt(page), pageSize: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { name, mail, age } = req.body;
    const normalizedMail = mail ? String(mail).trim().toLowerCase() : undefined;

    if (!name && !mail && age === undefined) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    const existingStudent = normalizedMail
      ? await Student.findOne({ mail: normalizedMail, _id: { $ne: req.params.id } })
      : null;

    if (existingStudent) {
      return res.status(409).json({ message: 'Email already exists. Please use a different email.' });
    }

    const updateData = {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(mail !== undefined ? { mail: normalizedMail } : {}),
      ...(age !== undefined ? { age: Number(age) } : {})
    };

    const student = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already exists. Please use a different email.' });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    // Soft Delete: update the flag instead of removing
    const student = await Student.findByIdAndUpdate(req.params.id, { isDeleted: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json({ message: 'Student archived' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.addMark = async (req, res) => {
  try {
    const { student, course, cgpa } = req.body;

    if (!student || !course || cgpa === undefined || cgpa === null) {
      return res.status(400).json({ message: 'Student, course, and CGPA are required' });
    }

    const normalizedCgpa = Number(cgpa);
    if (Number.isNaN(normalizedCgpa) || normalizedCgpa < 0 || normalizedCgpa > 10) {
      return res.status(400).json({ message: 'CGPA must be a number between 0 and 10' });
    }

    const grade = normalizedCgpa >= 8.5 ? 'A' : normalizedCgpa >= 7.0 ? 'B' : normalizedCgpa >= 5.5 ? 'C' : normalizedCgpa >= 4.0 ? 'D' : 'F';
    const mark = new Mark({ student, course, cgpa: normalizedCgpa, grade });
    await mark.save();
    res.status(201).json(mark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
