const mongoose = require('mongoose');

const catalogSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
});

const Catalog = mongoose.model('Catalog', catalogSchema);

module.exports = Catalog;
