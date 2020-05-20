const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  },
  IDcardPictureUrl: {
    type: String,
  },
  state: {
    type: String,
  },
  position: {
    type: String,
  },
  pin: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
    default: () => Date.now(),
  },
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
