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
  sales: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderItem',
    },
  ],
  createdAt: {
    type: Number,
    required: true,
    default: new Date().getTime(),
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
