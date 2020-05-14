const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  amount: {
    type: String,
  },
  net: {
    type: String,
  },
  fee: {
    type: String,
  },
  fee_vat: {
    type: String,
  },
  chargeId: {
    type: String,
  },
  status: {
    type: String,
  },
  discount: {
    type: String,
  },
  place: {
    branch: String,
    table: String,
  },
  by: {
    branch: {
      type: String,
      default: 'Online',
    },
    table: String,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderItem',
    },
  ],
  authorize_uri: {
    type: String,
  },
  createdAt: {
    type: Number,
    required: true,
    default: new Date().getTime(),
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
