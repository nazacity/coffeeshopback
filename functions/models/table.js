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
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
  discount: {
    type: Number,
  },
  total: {
    type: Number,
  },
  net: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Number,
    required: true,
    default: new Date().getTime(),
  },
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
