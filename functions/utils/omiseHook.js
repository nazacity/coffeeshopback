const omisehook = require('express')();
const cors = require('cors');
const mongoose = require('mongoose');

const DB_USERNAME = 'nazacity';
const DB_PASSWORD = 'CvzelCmkBZpwfQO6';
const DB_NAME = 'ecommerce';
const firestore = require('./firebase');

const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const User = require('../models/user');
const OnlineProduct = require('../models/onlineProduct');
const Stock = require('../models/stock');
const StockOut = require('../models/stockOut');

const omiseWebHooks = async (req, res, next) => {
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
      )
        .populate({ path: 'user' })
        .populate({ path: 'items', populate: { path: 'onlineProduct' } });

      let dbItems = [];
      await result.items.map(async (orderItem) => {
        dbItems.push({
          id: orderItem.id,
          product: {
            name: orderItem.onlineProduct.name,
            pictureUrl: orderItem.onlineProduct.pictureUrl,
          },
          quantity: orderItem.quantity,
        });

        const product = await OnlineProduct.findById(
          orderItem.onlineProduct.id
        );

        await OnlineProduct.findByIdAndUpdate(orderItem.onlineProduct.id, {
          sales: [...product.sales, orderItem.id],
        });

        if (product.stockOutDetail) {
          product.stockOutDetail.map(async (stockOut) => {
            const stock = await Stock.findOne({
              branch: result.branch,
              name: stockOut.name,
            });

            let createStockOut;
            if (stock.remain === 0) {
              createStockOut = await StockOut.create({
                stock: stock.id,
                out: stockOut.out * orderItem.quantity,
                cost: 0,
              });
            } else {
              createStockOut = await StockOut.create({
                stock: stock.id,
                out: stockOut.out * orderItem.quantity,
                cost:
                  (stock.amount / stock.remain) *
                  stockOut.out *
                  orderItem.quantity,
              });
            }

            const newRemain = stock.remain - stockOut.out;
            const newAmount = stock.amount - createStockOut.cost;
            let newStockOut = stock.stockOut;
            newStockOut.push(createStockOut.id);
            const newStock = await Stock.findByIdAndUpdate(stock.id, {
              remain: newRemain,
              amount: newAmount,
              stockOut: newStockOut,
            });
          });
        }
      });

      let dbData = {
        createdAt: new Date().getTime(),
        id: result.id,
        user: {
          id: result.user.id,
          lineId: result.user.lineId,
          firstName: result.user.firstName,
          pictureUrl: result.user.pictureUrl,
          phone: result.user.phone,
          position: {
            lat: +result.position.lat,
            lng: +result.position.lng,
          },
        },
        items: dbItems,
      };

      firestore.collection(`branchId=${result.branch}`).add(dbData);
      firestore.collection(`delivery=${result.branch}`).add(dbData);
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
};

omisehook.use(cors());

// Users
omisehook.post('/', omiseWebHooks);

module.exports = omisehook;
