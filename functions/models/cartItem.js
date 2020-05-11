const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Number,
    required: true,
    default: new Date().getTime(),
  },
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
