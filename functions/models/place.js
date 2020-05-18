const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branch',
  },
  table: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
    default: 'Open',
  },
  customer: {
    type: Number,
    default: 0,
  },
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
