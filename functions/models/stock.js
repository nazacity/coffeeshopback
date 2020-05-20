const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  pictureUrl: {
    type: String,
  },
  catalog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockCatalog',
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  },
  remain: {
    type: Number,
  },
  amount: {
    type: Number,
  },
  stockAdd: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockAdd',
    },
  ],
  stockOut: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockOut',
    },
  ],
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
