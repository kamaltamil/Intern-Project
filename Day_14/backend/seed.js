const mongoose = require('mongoose');
const Student = require('./src/models/Student');
const Mark = require('./src/models/Mark');

const courseOptions = ['MSC', 'BSC', 'CSE', 'IT', 'MCA', 'BCA', 'Other'];
const sampleNames = [
  'Aarav', 'Aisha', 'Arjun', 'Diya', 'Ishaan', 'Kavya', 'Meera', 'Neha', 'Rohan', 'Sanjay',
  'Tanvi', 'Vikram', 'Priya', 'Ananya', 'Riya', 'Nikhil', 'Shruti', 'Rahul', 'Mansi', 'Harsh'
];

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/student_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await Student.deleteMany({});
  await Mark.deleteMany({});

  const students = [];
  for (let i = 0; i < sampleNames.length; i += 1) {
    const name = sampleNames[i];
    const mail = `${name.toLowerCase()}${i + 1}@example.com`;
    const age = 18 + (i % 6);
    students.push({ name, mail, age });
  }

  const createdStudents = await Student.insertMany(students);

  const marks = createdStudents.map((student, index) => {
    const course = courseOptions[index % courseOptions.length];
    const cgpa = Number((6 + (index % 4) + Math.random()).toFixed(1));
    const grade = cgpa >= 8.5 ? 'A' : cgpa >= 7.0 ? 'B' : cgpa >= 5.5 ? 'C' : cgpa >= 4.0 ? 'D' : 'F';
    return {
      student: student._id,
      course,
      cgpa,
      grade,
    };
  });

  await Mark.insertMany(marks);
  console.log('Inserted 20 students and marks into MongoDB.');
  mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
