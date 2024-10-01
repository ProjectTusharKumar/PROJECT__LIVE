// models/Ad.js
const mongoose = require('mongoose');

// Define the schema for child data
const childDataSchema = new mongoose.Schema({
  parentUUID: { type: String, required: true },
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  childUUID: { type: String, required: true },
});

// Define the main ad schema
const adSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
  message: { type: String, required: true },
  childDataEntry: [childDataSchema], // Embedded child data
});

const Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;
