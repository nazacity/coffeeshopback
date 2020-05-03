const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  lineId: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  pictureUrl: {
    type: String,
  },
  state: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
    default: () => Date.now(),
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
