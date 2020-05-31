const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  lineId: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  pictureUrl: {
    type: String,
  },
  state: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
    default: () => Date.now(),
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
  },
  cards: [
    {
      id: String,
      cardInfo: {
        id: String,
        expiration_month: Number,
        expiration_year: Number,
        brand: String,
        last_digits: String,
      },
    },
  ],
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
