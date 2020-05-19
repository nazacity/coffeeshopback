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
  adult: {
    type: Number,
    default: 0,
  },
  children: {
    type: Number,
    default: 0,
  },
  package: {
    type: Number,
    default: 0,
  },
  startTime: {
    type: Date,
  },
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
  },
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
