const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./Common/authenticateToken');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/project_live');

const employeeSchema = new mongoose.Schema({
  password: { type: String },
  active: { type: String, enum: ['active', 'inactive'] }
});

const userSchema = new mongoose.Schema({
  employeeCode: { type: String, required: true, unique: true },
  Uuid: { type: String },
  fullname: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date, required: true },
  imagePath: { type: String },
  employee: { type: employeeSchema } // Embedded object
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Configure multer for file uploads, but we will not save the image
const storage = multer.memoryStorage(); // Use memory storage to avoid saving to disk

const upload = multer({ storage });

// Endpoint to handle file upload and save user data
app.post('/registration', upload.single('image'), async (req, res) => {
  const { employeeCode, fullname, mobile, email, dob, Uuid, imagePath } = req.body;

  try {
    // Check if the employeeCode, email, or mobile already exists
    const conditions = [{ employeeCode }, { email }, { mobile }];
    const existingUser = await User.findOne({ $or: conditions });

    if (existingUser) {
      const conflicts = [];
      if (existingUser.employeeCode === employeeCode) conflicts.push('Employee code');
      if (existingUser.email === email) conflicts.push('Email');
      if (existingUser.mobile === mobile) conflicts.push('Mobile number');

      const errorMessage = `${conflicts.join(', ')} already exists.`;
      return res.status(400).json({ message: errorMessage });
    }

    // Use the path provided by the client (assumed to be in req.body)
    // This assumes the frontend provides the actual file path of the image
    const filePath = imagePath ? `file://${imagePath}` : null;

    // Create and save the new user
    const newUser = new User({
      employeeCode,
      Uuid,
      fullname,
      mobile,
      email,
      dob,
      imagePath: filePath, // Saving the provided absolute file path
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error occurred while processing request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Serve static files from the 'profile' directory
app.use('/profile', express.static('profile'));
// Login Route
app.post('/login', async (req, res) => {
  const { employeeCode, password } = req.body;

  try {
    // Find user by employeeCode
    const user = await User.findOne({ employeeCode });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password (direct comparison)
    if (password !== user.employee.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Protected profile route
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Endpoint to get employee details by employeeCode
app.get('/api/employee/:employeeCode', async (req, res) => {
  const { employeeCode } = req.params;

  try {
    const user = await User.findOne({ employeeCode });
    if (user) {
      const imageUrl = user.imagePath ? `${req.protocol}://${req.get('host')}/${user.imagePath}` : null;
      res.json({ ...user.toObject(), image: imageUrl });
    } else {
      res.status(404).json({ message: 'Employee code not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

// Endpoint to update user details
app.post('/api/users/update', authenticateToken, async (req, res) => {
  debugger
  const { employeeCode, password, status } = req.body;

  if (!employeeCode) {
    return res.status(400).json({ message: 'Employee Code is required' });
  }

  try {
    // Construct the image path if an image was uploaded
    const updateFields = {
      'employee.active': status,
      'employee.password': password
    };

    const updatedUser = await User.findOneAndUpdate(
      { employeeCode },
      updateFields,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
