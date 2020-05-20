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
  stock: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
    },
  ],
});

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
