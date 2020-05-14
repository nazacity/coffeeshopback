const User = require('../models/user');
const Product = require('../models/product');
const Catalog = require('../models/catalog');
const OrderItem = require('../models/orderItem');
const Order = require('../models/order');
const Promotion = require('../models/promotion');
const Employee = require('../models/employee');

const axios = require('axios');
const moment = require('moment');

const Query = {
  user: async (parent, args, { accessToken }, info) => {
    if (!accessToken) res.send({ message: 'No AccessToken' });
    let line;
    await axios
      .get('https://api.line.me/v2/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        line = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
    const user = await User.findOne({ lineId: line.userId })
      .populate({
        path: 'carts',
        populate: { path: 'product' },
      })
      .populate({
        path: 'orders',
        populate: { path: 'items', populate: { path: 'product' } },
      });
    return user;
  },
  users: async (parent, args, context, info) => {
    return User.find({}).populate({
      path: 'carts',
      populate: { path: 'product' },
    });
  },
  catalogs: async (parent, args, context, info) => {
    return Catalog.find({});
  },
  product: async (parent, { id }, context, info) => {
    console.log('id', id);
    const product = await Product.findById(id);
    console.log('product', product);

    return product;
  },
  products: async (parent, args, context, info) => {
    return Product.find({});
  },
  orders: async (parent, args, { accessToken }, info) => {
    return Order.find({})
      .populate({
        path: 'items',
        populate: { path: 'product' },
      })
      .populate({ path: 'user' });
  },
  ordersByDay: async (parent, { year, month, day }, context, info) => {
    let start = moment(`${year}-${month}-${day}`, 'YYYY MM DD').format('x');
    let end = moment(`${year}-${month}-${day + 1}`, 'YYYY MM DD').format('x');

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } })
      .populate({ path: 'items', populate: { path: 'product' } })
      .populate({ path: 'user' });

    return orders;
  },
  ordersByDate: async (parent, { startDate, endDate }, context, info) => {
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate({ path: 'items', populate: { path: 'product' } })
      .populate({ path: 'user' });

    return orders;
  },
  ordersByMonth: async (parent, { year, month }, context, info) => {
    let start = moment(`${year} ${month} 1`, 'YYYY MM DD').format('x');
    let end = moment(`${year} ${month + 1} 1`, 'YYYY MM DD').format('x');

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate({ path: 'items', populate: { path: 'product' } })
      .populate({ path: 'user' });

    return orders;
  },
  promotion: async (parent, args, context, info) => {
    return Promotion.find({}).populate({
      path: 'products',
    });
  },
  employee: async (parent, args, { accessToken }, info) => {
    if (!accessToken) res.send({ message: 'No AccessToken' });
    let line;
    await axios
      .get('https://api.line.me/v2/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        line = res.data;
      })
      .catch((err) => {
        console.log(err);
      });

    if (!line) throw new Error('No Line User');
    const employees = await Employee.find({}).populate({ path: 'user' });

    index = await employees.findIndex(
      (data) => data.user.lineId === line.userId
    );

    const employee = employees[index];

    return employee;
  },
  employees: async (parent, args, { accessToken }, info) => {
    if (!accessToken) res.send({ message: 'No AccessToken' });
    let line;
    await axios
      .get('https://api.line.me/v2/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        line = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
    const user = await User.findOne({ lineId: line.userId });
    if (user.state !== 'admin') throw new Error('No Authorization');
    console.log('employees run');
    return Employee.find({}).populate({ path: 'user' });
  },
};

module.exports = Query;
