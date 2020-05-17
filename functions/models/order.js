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
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
  },
  by: {
    type: String,
  },
  step: {
    type: String,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderItem',
    },
  ],
  authorizeUri: {
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
