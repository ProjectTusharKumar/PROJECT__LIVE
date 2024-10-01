const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  employeeCode: {
    type: String,
    required: true,
    unique: true
  },
  fullname: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  dob: {
    type: Date,
    required: true
  },
  imagePath: {
    type: String // Store the image file path or URL
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
