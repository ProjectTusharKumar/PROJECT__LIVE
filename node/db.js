const mongoose = require('mongoose');

const userDbUri = 'mongodb://localhost:27017/mydatabase';
const adDbUri = 'mongodb://localhost:27017/adsdatabase';

// MongoDB connection for user database
mongoose.connect(userDbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useFindAndModify: true,

});
const userDb = mongoose.connection;
userDb.on('error', console.error.bind(console, 'User database connection error:'));
userDb.once('open', () => {
  console.log('Connected to user database');
});

// MongoDB connection for ad database
const adDb = mongoose.createConnection(adDbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
adDb.on('error', console.error.bind(console, 'Ad database connection error:'));
adDb.once('open', () => {
  console.log('Connected to ad database');
});

module.exports = { userDb, adDb };
