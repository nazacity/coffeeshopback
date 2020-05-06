const omisehook = require('express')();
const cors = require('cors');
const mongoose = require('mongoose');

const DB_USERNAME = 'nazacity';
const DB_PASSWORD = 'CvzelCmkBZpwfQO6';
const DB_NAME = 'ecommerce';
const Order = require('../models/order');

const omiseWebHooks = async (req, res, next) => {
  try {
    mongoose.connect(
      `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@graphql-basic-zy4vi.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
      {
        useUnifiedTopology: true,
        useFindAndModify: false,
        useNewUrlParser: true,
      }
    );
    const { data, key } = req.body;
    if (key === 'charge.complete') {
      if (data.status === 'successful') {
        const result = await Order.findOneAndUpdate(
          { chargeId: data.id },
          {
            status: data.status,
          }
        );
      } else {
        await Order.findOneAndRemove({ chargeId: data.id });
      }
    }
  } catch (error) {}
};

omisehook.use(cors());

// Users
omisehook.post('/', omiseWebHooks);

module.exports = omisehook;
