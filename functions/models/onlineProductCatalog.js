const mongoose = require('mongoose');

const onlineProductCatalogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  th: {
    type: String,
    required: true,
  },
  onlineProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OnlineProduct',
    },
  ],
});

const OnlineProductCatalog = mongoose.model(
  'OnlineProductCatalog',
  onlineProductCatalogSchema
);

module.exports = OnlineProductCatalog;
