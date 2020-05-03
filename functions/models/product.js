const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  price: {
    type: String,
    require: true,
  },
  pictureUrl: {
    type: String,
    require: true,
  },
  catalog: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: () => Date.now(),
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
