const mongoose = require('mongoose');

const stockAddSchema = new mongoose.Schema({
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
  },
  buy: {
    type: Number,
  },
  amount: {
    type: Number,
  },
  createdAt: {
    type: Date,
    required: true,
    default: () => Date.now(),
  },
});

const StockAdd = mongoose.model('StockAdd', stockAddSchema);

module.exports = StockAdd;
