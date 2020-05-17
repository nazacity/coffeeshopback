const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true,
  },
  table: {
    type: String,
    required: true,
  },
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
