const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true,
  },
  place: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
    },
  ],
});

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
