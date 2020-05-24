const mongoose = require('mongoose');

const storeProductSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  stockOutDetail: [
    {
      name: {
        type: String,
        require: true,
      },
      out: {
        type: String,
        require: true,
      },
    },
  ],
  pictureUrl: {
    type: String,
  },
  price: {
    type: Number,
    default: 0,
  },
  package: {
    type: Number,
    default: 0,
  },
  catalog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreProductCatalog',
  },
  sales: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderItem',
    },
  ],
});

const StoreProduct = mongoose.model('StoreProduct', storeProductSchema);

module.exports = StoreProduct;
