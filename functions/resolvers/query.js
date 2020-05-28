const User = require('../models/user');
const Product = require('../models/product');
const Catalog = require('../models/catalog');
const OrderItem = require('../models/orderItem');
const Order = require('../models/order');
const Promotion = require('../models/promotion');
const Employee = require('../models/employee');
const Table = require('../models/table');
const Place = require('../models/place');
const Branch = require('../models/branch');
const StockCatalog = require('../models/stockCatalog');
const Stock = require('../models/stock');
const StockName = require('../models/stockName');
const StoreProductCatalog = require('../models/storeProductCatalog');
const StoreProduct = require('../models/storeProduct');
const OnlineProductCatalog = require('../models/onlineProductCatalog');
const OnlineProduct = require('../models/onlineProduct');

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
        path: 'orders',
        populate: { path: 'items', populate: { path: 'onlineProduct' } },
      })
      .populate({ path: 'table' });
    return user;
  },
  users: async (parent, args, context, info) => {
    return User.find({})
      .populate({ path: 'table' })
      .populate({
        path: 'orders',
        populate: { path: 'items', populate: { path: 'onlineProduct' } },
      });
  },
  orders: async (parent, args, { accessToken }, info) => {
    return Order.find({})
      .populate({
        path: 'items',
        populate: { path: 'product' },
      })
      .populate({ path: 'user' })
      .populate({ path: 'table' });
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
    return Employee.find({}).populate({ path: 'user' });
  },
  bestSaleMonthly: async (parent, { year, month }, { accessToken }, info) => {
    // if (!accessToken) res.send({ message: 'No AccessToken' });
    // let line;
    // await axios
    //   .get('https://api.line.me/v2/profile', {
    //     headers: { Authorization: `Bearer ${accessToken}` },
    //   })
    //   .then((res) => {
    //     line = res.data;
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
    // const user = await User.findOne({ lineId: line.userId });
    // if (user.state !== 'admin') throw new Error('No Authorization');
    let start = moment(`${year} ${month} 1`, 'YYYY MM DD').format('x');
    let end = moment(`${year} ${month + 1} 1`, 'YYYY MM DD').format('x');

    const products = await Product.find({}).populate({ path: 'sales' });

    let result = [];
    await products.map((prod) => {
      let month = [];
      month = prod.sales.filter(
        (orderItem) => orderItem.createdAt > start && orderItem.createdAt < end
      );

      let totalSales = 0;

      totalSales = month.reduce(
        (sum, orderItem) => sum + orderItem.quantity,
        0
      );

      if (totalSales !== 0) {
        result.push({ id: prod.id, ...prod._doc, totalSales });
      }
    });

    const bestSaleProduct = await result.sort((a, b) => {
      return b.totalSales - a.totalSales;
    });
    return bestSaleProduct.slice(0, 10);
  },
  saleDaily: async (parent, { year, month, day }, { accessToken }, info) => {
    // if (!accessToken) res.send({ message: 'No AccessToken' });
    // let line;
    // await axios
    //   .get('https://api.line.me/v2/profile', {
    //     headers: { Authorization: `Bearer ${accessToken}` },
    //   })
    //   .then((res) => {
    //     line = res.data;
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
    // const user = await User.findOne({ lineId: line.userId });
    // if (user.state !== 'admin') throw new Error('No Authorization');

    let start = moment(`${year} ${month} ${day}`, 'YYYY MM DD').format('x');
    let end = moment(`${year} ${month} ${day + 1}`, 'YYYY MM DD').format('x');
    console.log(year);
    console.log(month);
    console.log(day);

    const products = await Product.find({}).populate({ path: 'sales' });

    let result = [];
    await products.map((prod) => {
      let day = [];
      day = prod.sales.filter(
        (orderItem) => orderItem.createdAt > start && orderItem.createdAt < end
      );

      let totalSales = 0;

      totalSales = day.reduce((sum, orderItem) => sum + orderItem.quantity, 0);

      if (totalSales !== 0) {
        result.push({ id: prod.id, ...prod._doc, totalSales });
      }
    });

    const saleProduct = await result.sort((a, b) => {
      return b.totalSales - a.totalSales;
    });
    console.log(result);
    return saleProduct;
  },
  branch: async (parent, arg, { accessToken }, info) => {
    return Branch.find({})
      .populate({
        path: 'place',
        populate: { path: 'bill' },
      })
      .populate({
        path: 'stock',
        populate: ['catalog', 'stockAdd', 'stockOut'],
      });
  },
  place: async (parent, { id }, { accessToken }, info) => {
    return Place.findById(id)
      .populate({ path: 'branch' })
      .populate({
        path: 'bill',
        populate: { path: 'items', populate: { path: 'storeProduct' } },
      });
  },
  places: async (parent, arg, { accessToken }, info) => {
    return Place.find({})
      .populate({ path: 'branch' })
      .populate({
        path: 'bill',
        populate: { path: 'items', populate: { path: 'storeProduct' } },
      });
  },
  stockCatalog: async (parent, arg, { accessToken }, info) => {
    return StockCatalog.find({});
  },
  stockName: async (parent, arg, { accessToken }, info) => {
    const stocks = await Stock.find({});
    let stockName = [];
    stocks.map((stock) => {
      if (!stockName.includes(stock.name)) {
        stockName.push({ name: stock.name });
      }
    });
    return stockName;
  },
  storeProductCatalog: async (parent, arg, context, info) => {
    return StoreProductCatalog.find({}).populate({ path: 'storeProducts' });
  },
  storeProduct: async (parent, arg, context, info) => {
    return StoreProduct.find({}).populate({ path: 'catalog' });
  },
  onlineProductCatalog: async (parent, arg, context, info) => {
    return OnlineProductCatalog.find({}).populate({ path: 'onlineProducts' });
  },
  onlineProduct: async (parent, arg, context, info) => {
    return OnlineProduct.find({}).populate({ path: 'catalog' });
  },
};

module.exports = Query;
