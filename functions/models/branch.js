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
  position: {
    lat: {
      type: String,
    },
    lng: {
      type: String,
    },
  },
});

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
