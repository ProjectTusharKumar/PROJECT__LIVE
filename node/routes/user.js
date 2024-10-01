const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /registration
router.post('/registration', async (req, res) => {
  const { employeeCode, fullname, mobile, email, dob } = req.body;
  const imagePath = req.file ? req.file.path : '';

  try {
    // Check if the employee code, email, or mobile number already exists
    const existingUser = await User.findOne({
      $or: [
        { employeeCode },
        { email },
        { mobile }
      ]
    });

    if (existingUser) {
      if (existingUser.employeeCode === employeeCode) {
        return res.status(400).json({ error: 'Employee code must be unique' });
      } else if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email is already registered' });
      } else if (existingUser.mobile === mobile) {
        return res.status(400).json({ error: 'Mobile number is already registered' });
      }
    }

    // Create a new user instance
    const newUser = new User({
      employeeCode,
      fullname,
      mobile,
      email,
      dob,
      imagePath
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
