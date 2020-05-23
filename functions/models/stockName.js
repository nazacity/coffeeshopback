const mongoose = require('mongoose');

const stockNameSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const StockName = mongoose.model('StockName', stockNameSchema);

module.exports = StockName;
