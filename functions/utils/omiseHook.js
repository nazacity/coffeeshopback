const omisehook = require('express')();
const cors = require('cors');
const mongoose = require('mongoose');

const DB_USERNAME = 'nazacity';
const DB_PASSWORD = 'CvzelCmkBZpwfQO6';
const DB_NAME = 'ecommerce';
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const User = require('../models/user');

const omiseWebHooks = async (req, res, next) => {
  try {
    await mongoose.connect(
      `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@graphql-basic-zy4vi.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
      {
        useUnifiedTopology: true,
        useFindAndModify: false,
        useNewUrlParser: true,
      }
    );
    const { data, key } = req.body;
    // Check omise callback process
    if (key === 'charge.complete') {
      // Check omise callback status
      // successful update order status
      if (data.status === 'successful') {
        const result = await Order.findOneAndUpdate(
          { chargeId: data.id },
          {
            status: data.status,
          }
        );
      } else {
        // failed remove order and orderitem and orderlist from user
        const order = await Order.findOneAndRemove({ chargeId: data.id });
        await order.items.map(async (item) => {
          await OrderItem.findByIdAndRemove(item);
        });

        const user = await User.findOne(order.user);
        const orders = await user.orders.filter((orderList) => {
          return orderList.toString() !== order.id.toString();
        });
        await User.findByIdAndUpdate(user.id, { orders });
      }
    }
  } catch (error) {}
};

omisehook.use(cors());

// Users
omisehook.post('/', omiseWebHooks);

module.exports = omisehook;
