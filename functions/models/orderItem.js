const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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
  state: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
    default: new Date().getTime(),
  },
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
