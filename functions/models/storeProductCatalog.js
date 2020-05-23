const mongoose = require('mongoose');

const storeProductCatalogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  th: {
    type: String,
    required: true,
  },
  storeProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoreProduct',
    },
  ],
});

const StoreProductCatalog = mongoose.model(
  'StoreProductCatalog',
  storeProductCatalogSchema
);

module.exports = StoreProductCatalog;
