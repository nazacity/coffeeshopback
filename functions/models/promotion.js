const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  detail: {
    type: String,
    require: true,
  },
  pictureUrl: {
    type: String,
    require: true,
  },
  price: {
    type: String,
    require: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  createdAt: {
    type: Number,
    required: true,
    default: new Date().getTime(),
  },
});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
