const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
  },
  adult: {
    type: Number,
    required: true,
  },
  children: {
    type: Number,
    required: true,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderItem',
    },
  ],
  discount: {
    type: Number,
  },
  total: {
    type: Number,
  },
  net: {
    type: Number,
  },
  createdAt: {
    type: Number,
    required: true,
    default: new Date().getTime(),
  },
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
