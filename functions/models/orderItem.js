const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  storeProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreProduct',
  },
  onlineProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreProduct',
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
  cost: {
    type: Number,
  },
  createdAt: {
    type: Number,
    required: true,
    default: new Date().getTime(),
  },
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
