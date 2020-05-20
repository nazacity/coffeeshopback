const mongoose = require('mongoose');

const stockCatalogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  th: {
    type: String,
    required: true,
  },
});

const StockCatalog = mongoose.model('StockCatalog', stockCatalogSchema);

module.exports = StockCatalog;
