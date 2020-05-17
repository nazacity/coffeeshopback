const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
  },
  total: {
    type: Number,
    required: true,
  },
  discount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  net: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
  createdAt: {
    type: Number,
    required: true,
    default: new Date().getTime(),
  },
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
