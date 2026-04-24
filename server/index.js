const express = require('express');
const cors = require('cors');
const { User, Student, Attendance, Fees, initDb } = require('./database');
require('dotenv').config();

const app = express();

// Allow requests from both local and deployed frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL // Will be set during deployment
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Login API
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        
        res.json({
            id: user._id,
            username: user.username,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Students (Admin)
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        const studentsWithAttendance = await Promise.all(students.map(async (student) => {
            const attendance = await Attendance.findOne({ roll_no: student.roll_no });
            return {
                ...student.toObject(),
                percentage: attendance ? attendance.percentage : null,
                attended_lectures: attendance ? attendance.attended_lectures : null
            };
        }));
        res.json(studentsWithAttendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Single Student Detail
app.get('/api/students/:rollNo', async (req, res) => {
    const { rollNo } = req.params;
    try {
        const student = await Student.findOne({ roll_no: rollNo });
        if (!student) return res.status(404).json({ error: 'Student not found' });
        
        const attendance = await Attendance.findOne({ roll_no: rollNo });
        const fees = await Fees.findOne({ roll_no: rollNo });
        
        const result = {
            ...student.toObject(),
            percentage: attendance ? attendance.percentage : null,
            attended_lectures: attendance ? attendance.attended_lectures : null,
            total_lectures: attendance ? attendance.total_lectures : null,
            sem1: fees ? fees.sem1 : null,
            sem2: fees ? fees.sem2 : null,
            sem3: fees ? fees.sem3 : null,
            sem4: fees ? fees.sem4 : null
        };
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Stats for Dashboard
app.get('/api/stats', async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const attendances = await Attendance.find();
        const averageAttendance = attendances.length > 0 ? attendances.reduce((sum, a) => sum + (a.percentage || 0), 0) / attendances.length : 0;
        
        const categoryDistribution = await Student.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        
        res.json({
            totalStudents,
            averageAttendance,
            categoryDistribution: categoryDistribution.map(c => ({ category: c._id, count: c.count }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add New Student (Admin)
app.post('/api/students', async (req, res) => {
    const s = req.body;
    try {
        // Check if student exists
        const existing = await Student.findOne({ roll_no: s.roll_no });
        if (existing) return res.status(400).json({ error: "Roll Number already exists" });

        // Create Student
        await Student.create({
            roll_no: s.roll_no,
            name: s.name,
            father_name: s.father_name,
            mother_name: s.mother_name,
            mobile: s.mobile,
            reg_no: s.reg_no,
            dob: s.dob,
            gender: s.gender,
            category: s.category,
            religion: s.religion
        });

        // Create User
        await User.create({ username: s.roll_no, password: 'student123', role: 'student' });

        // Initialize Attendance
        await Attendance.create({ roll_no: s.roll_no, total_lectures: 0, attended_lectures: 0, percentage: 0 });

        // Initialize Fees
        await Fees.create({ roll_no: s.roll_no, sem1: 'Pending', sem2: 'Pending', sem3: 'Pending', sem4: 'Pending', category: s.category });

        res.json({ message: "Student added successfully", roll_no: s.roll_no });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Student (Admin)
app.put('/api/students/:rollNo', async (req, res) => {
    const { rollNo } = req.params;
    const updates = req.body;
    try {
        const result = await Student.updateOne({ roll_no: rollNo }, updates);
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: "Student updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Student (Admin)
app.delete('/api/students/:rollNo', async (req, res) => {
    const { rollNo } = req.params;
    try {
        await Fees.deleteOne({ roll_no: rollNo });
        await Attendance.deleteOne({ roll_no: rollNo });
        await User.deleteOne({ username: rollNo });
        const result = await Student.deleteOne({ roll_no: rollNo });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: "Student deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
});
