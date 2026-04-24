const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: String
});

const studentSchema = new mongoose.Schema({
  roll_no: { type: String, unique: true },
  name: String,
  father_name: String,
  mother_name: String,
  address: String,
  mobile: String,
  email: String,
  gender: String,
  dob: String,
  reg_no: String,
  category: String,
  religion: String,
  caste: String
});

const attendanceSchema = new mongoose.Schema({
  roll_no: { type: String, unique: true },
  total_lectures: Number,
  attended_lectures: Number,
  percentage: Number
});

const feesSchema = new mongoose.Schema({
  roll_no: { type: String, unique: true },
  sem1: String,
  sem2: String,
  sem3: String,
  sem4: String,
  category: String
});

const User = mongoose.model('User', userSchema);
const Student = mongoose.model('Student', studentSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Fees = mongoose.model('Fees', feesSchema);

const initDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal');
    console.log('Connected to MongoDB');

    // Insert default admin user if not exists
    const adminExists = await User.findOne({ username: 'admin2024' });
    if (!adminExists) {
      await User.create({ username: 'admin2024', password: 'admin2024', role: 'admin' });
      console.log('Admin user created');
    }
  } catch (err) {
    console.error('Database connection error:', err);
  }
};

module.exports = { User, Student, Attendance, Fees, initDb };
