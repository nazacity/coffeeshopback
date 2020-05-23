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
  storeProduct: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoreProduct',
    },
  ],
});

const StoreProduct = mongoose.model(
  'StoreProductCatalog',
  storeProductCatalogSchema
);

module.exports = StoreProduct;
