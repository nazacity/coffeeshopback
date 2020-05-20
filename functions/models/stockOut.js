const mongoose = require('mongoose');

const stockOutSchema = new mongoose.Schema({
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
  },
  out: {
    type: Number,
  },
  cost: {
    type: Number,
  },
});

const StockOut = mongoose.model('StockOut', stockOutSchema);

module.exports = StockOut;
