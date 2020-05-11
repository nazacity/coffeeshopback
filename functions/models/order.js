const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  amount: {
    type: String,
    require: true,
  },
  net: {
    type: String,
    require: true,
  },
  fee: {
    type: String,
    require: true,
  },
  fee_vat: {
    type: String,
    require: true,
  },
  chargeId: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    require: true,
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
