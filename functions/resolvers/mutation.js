const axios = require('axios');
const User = require('../models/user');
const Product = require('../models/product');
const Catalog = require('../models/catalog');
const CartItem = require('../models/cartItem');
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
const StockAdd = require('../models/stockAdd');
const StockOut = require('../models/stockOut');
const StoreProductCatalog = require('../models/storeProductCatalog');
const StoreProduct = require('../models/storeProduct');
const OnlineProductCatalog = require('../models/onlineProductCatalog');
const OnlineProduct = require('../models/onlineProduct');
const db = require('../utils/firebase');

const {
  retrieveCustomer,
  createCustomer,
  createCharge,
  createChargeInternetBanking,
} = require('../utils/omiseUtil');

const Mutation = {
  signinWithAccessToken: async (parent, { accessToken }, context, info) => {
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
    if (!line) {
      const data = {
        id: 'guess',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        pictureUrl: '',
        state: 'guess',
        orders: [],
      };
      return data;
    }
    const user = await User.findOne({ lineId: line.userId });

    if (user) {
      if (user.pictureUrl !== line.pictureUrl) {
        await User.findByIdAndUpdate(user.id, {
          pictureUrl: line.pictureUrl,
        });
      }

      const updatedUser = await User.findById(user.id).populate({
        path: 'orders',
        populate: { path: 'items', populate: { path: 'onlineProduct' } },
      });
      return updatedUser;
    } else {
      const createUser = await User.create({
        lineId: line.userId,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        pictureUrl: line.pictureUrl,
        state: 'client0',
      });
      return User.findById(createUser.id).populate({
        path: 'orders',
        populate: { path: 'items', populate: { path: 'onlineProduct' } },
      });
    }
  },
  register: async (
    parent,
    { firstName, lastName, email, phone },
    { accessToken },
    info
  ) => {
    if (!accessToken) throw new Error('Access Token is not defined');
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
    if (!line) throw new Error('Something wrong while calling Line Profile');

    await User.findOneAndUpdate(
      { lineId: line.userId },
      { firstName, lastName, email, phone, state: 'client1' }
    );
    const user = await User.findOne({ lineId: line.userId });
    return user;
  },
  updateUser: async (
    parent,
    { id, firstName, lastName, email, phone, state },
    { accessToken },
    info
  ) => {
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

    // Check Admin
    const admin = await User.findOne({ lineId: line.userId });
    if (admin.state !== 'admin') throw new Error('No Authorization');

    const user = await User.findById(id);

    const newInfo = {
      firstName: firstName ? firstName : user.firstName,
      lastName: lastName ? lastName : user.lastName,
      email: email ? email : user.email,
      phone: phone ? phone : user.phone,
      state: state ? state : user.state,
    };
    if (state === 'admin' || state === 'employee') {
      const employees = await Employee.find({}).populate({ path: 'user' });
      let indexEmployee = await employees.findIndex((data) => data.id === id);

      if (indexEmployee === -1) {
        await Employee.create({
          user: user.id,
          IDcardPictureUrl: '',
          state: '',
          position: '',
          pin: '',
        });
      }
    }

    await User.findByIdAndUpdate(id, newInfo);

    return User.findById(id);
  },
  createPromotion: async (
    parent,
    { id, title, detail, price, products, pictureUrl },
    { accessToken },
    info
  ) => {
    if (!accessToken) throw new Error('Access Token is not defined');
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

    const promotion = await Promotion.findById(id);

    if (!promotion) throw new Error('Promotion does not exit');

    const updatePromotion = {
      title: title ? title : promotion.title,
      detail: detail ? detail : promotion.detail,
      price: price ? price : promotion.price,
      pictureUrl: pictureUrl ? pictureUrl : promotion.pictureUrl,
    };

    await Promotion.findByIdAndUpdate(id, updatePromotion);

    const returnPromotion = await Promotion.findById(promotion.id).populate({
      path: 'products',
    });

    return returnPromotion;
  },
  deletePromotion: async (parent, { id }, { accessToken }, info) => {
    if (!accessToken) throw new Error('Access Token is not defined');
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

    const promotion = await Promotion.findByIdAndRemove(id);

    return promotion;
  },
  updateEmployee: async (
    parent,
    { id, IDcardPictureUrl, state, position, pin },
    { accessToken },
    info
  ) => {
    if (!accessToken) throw new Error('Access Token is not defined');
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

    const employee = await Employee.findById(id).populate({ path: 'user' });

    if (user.state !== 'admin' && user.id !== employee.user.id)
      throw new Error('No Authorization');

    const newInfo = {
      IDcardPictureUrl: IDcardPictureUrl
        ? IDcardPictureUrl
        : employee.IDcardPictureUrl,
      state: state ? state : employee.state,
      position: position ? position : employee.position,
      pin: pin ? pin : employee.pin,
    };

    await Employee.findByIdAndUpdate(id, newInfo);

    const newEmployee = await Employee.findById(id).populate({ path: 'user' });

    return newEmployee;
  },
  deleteEmployee: async (parent, { id }, { accessToken }, info) => {
    if (!accessToken) throw new Error('Access Token is not defined');
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
    if (user.state !== 'admin' && user.id !== employee.user.id)
      throw new Error('No Authorization');

    const employee = await Employee.findByIdAndRemove(id);
    const updateUser = await User.findByIdAndUpdate(employee.user, {
      state: 'client2',
    });

    return employee;
  },
  cancelOrderItemByID: async (
    parent,
    { orderId, orderItemId, quantity },
    { accessToken },
    info
  ) => {
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

    const order = await Table.findById(orderId).populate({
      path: 'items',
      populate: { path: 'storeProduct' },
    });

    let indexItem = order.items.findIndex((item) => item.id === orderItemId);

    if (order.items[indexItem].quantity - quantity === 0) {
      await OrderItem.findByIdAndRemove(orderItemId);
      let items = order.items.filter((item) => item.id !== orderItemId);
      await Table.findByIdAndUpdate(orderId, { items });
    } else {
      const oldOrderItem = await OrderItem.findById(orderItemId);
      let newOrderItemQuantity = oldOrderItem.quantity - quantity;
      await OrderItem.findByIdAndUpdate(orderItemId, {
        quantity: newOrderItemQuantity,
      });
    }

    return Table.findById(orderId)
      .populate({ path: 'user' })
      .populate({ path: 'items', populate: { path: 'storeProduct' } });
  },
  doneOrderItemByID: async (parent, { orderItemId }, { accessToken }, info) => {
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

    await OrderItem.findByIdAndUpdate(orderItemId, {
      state: 'done',
    });

    return OrderItem.findById(orderItemId);
  },
  createPlace: async (parent, { branchId, table }, { accessToken }, info) => {
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

    if (user.state !== 'admin' && user.id !== employee.user.id)
      throw new Error('No Authorization');
    const place = await Place.create({ branch: branchId, table });
    const branch = await Branch.findById(branchId).populate({ path: 'place' });

    let indexTable = branch.place.findIndex((plac) => plac.table == table);
    if (indexTable > -1) throw new Error('Table already exsit');

    let newPlace = [...branch.place, place];

    await Branch.findByIdAndUpdate(branchId, {
      place: newPlace,
    });

    return Branch.findById(branchId).populate({
      path: 'place',
      populate: { path: 'bill' },
    });
  },
  deletePlace: async (parent, { id }, { accessToken }, info) => {
    return await Place.findByIdAndRemove(id);
  },
  createBranch: async (parent, { branch }, { accessToken }, info) => {
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
    if (user.state !== 'admin' && user.id !== employee.user.id)
      throw new Error('No Authorization');

    const existBranch = await Branch.find({ branch });
    if (existBranch.length > 0) throw new Error('Branch already exist');
    const createBranch = await Branch.create({ branch });
    return createBranch;
  },
  deleteBranch: async (parent, { id }, { accessToken }, info) => {
    return Branch.findByIdAndRemove(id);
  },
  updatePlaceAndCreateTable: async (
    parent,
    { placeId, adult, children, package },
    { accessToken },
    info
  ) => {
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
    if (user.state !== 'admin' && user.state !== 'employee')
      throw new Error('No Authorization');

    const createTable = await Table.create({
      place: placeId,
      adult,
      children,
      package,
    });

    const place = await Place.findByIdAndUpdate(placeId, {
      adult,
      children,
      bill: createTable.id,
      state: 'Close',
    });

    return Branch.findById(place.branch).populate({
      path: 'place',
      populate: { path: 'bill' },
    });
  },
  createStockCatalog: async (parent, { name, th }, { accessToken }, info) => {
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

    const stockCatalog = await StockCatalog.findOne({ name });
    if (stockCatalog) throw new Error('StcokCatalog already exsit');

    return StockCatalog.create({ name, th });
  },
  createStock: async (
    parent,
    { name, catalogId, branchId, pictureUrl },
    { accessToken },
    info
  ) => {
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
    const checkBranch = await Branch.findById(branchId).populate({
      path: 'stock',
    });
    let index = checkBranch.stock.findIndex((stock) => stock.name === name);
    if (index > -1) throw new Error('Stock already exist in this branch');

    // const createStockName = await StockName.create({ name });

    const createStock = await Stock.create({
      name,
      catalog: catalogId,
      pictureUrl,
      branch: branchId,
      remain: 0,
      amount: 0,
    });

    const updateStockCatalog = await StockCatalog.findById(catalogId);
    await StockCatalog.findByIdAndUpdate(catalogId, {
      stock: [...updateStockCatalog.stock, createStock.id],
    });

    const updateBranch = await Branch.findByIdAndUpdate(branchId, {
      stock: [...checkBranch.stock, createStock.id],
    });

    return Branch.findById(branchId)
      .populate({
        path: 'place',
        populate: { path: 'bill' },
      })
      .populate({
        path: 'stock',
        populate: ['catalog', 'stockAdd', 'stockOut'],
      });
  },
  deleteStockCatalog: async (parent, { id }, { accessToken }, info) => {
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

    const deleteCatalog = await StockCatalog.findByIdAndRemove(id);

    const branch = await Branch.find({});
    await branch.map(async (bran) => {
      let newBrancStock;
      await deleteCatalog.stock.map(async (stockId) => {
        newBrancStock = await bran.stock.map(async (branStockId) => {
          if (stockId.toString() === branStockId.toString()) {
            newBrancStock = bran.stock.filter(
              (branStockId) => branStockId.toString() !== stockId.toString()
            );

            await Branch.findByIdAndUpdate(bran.id, { stock: newBrancStock });
          }
        });

        await Stock.findByIdAndRemove(stockId.toString());
      });
    });

    return deleteCatalog;
  },
  updateStock: async (
    parent,
    { id, name, pictureUrl },
    { accessToken },
    info
  ) => {
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

    const updateStock = await Stock.findByIdAndUpdate(id, {
      name,
      pictureUrl,
    });
    const updateStockName = await StockName.findOneAndUpdate(
      { name: updateStock.name },
      { name: name }
    );

    return Branch.findById(updateStock.branch)
      .populate({
        path: 'place',
        populate: { path: 'bill' },
      })
      .populate({
        path: 'stock',
        populate: ['catalog', 'stockAdd', 'stockOut'],
      });
  },
  deleteStock: async (parent, { id }, { accessToken }, info) => {
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

    const deleteStock = await Stock.findByIdAndRemove(id);

    const updateBranch = await Branch.findById(deleteStock.branch);
    let stockBranch = updateBranch.stock.filter((stock) => {
      return stock.toString() !== deleteStock.id.toString();
    });
    await Branch.findByIdAndUpdate(deleteStock.branch, { stock: stockBranch });

    const updateStockCatalog = await StockCatalog.findById(deleteStock.catalog);
    let stockCatalog = updateStockCatalog.stock.filter((stock) => {
      return stock.toString() !== deleteStock.id.toString();
    });
    await StockCatalog.findByIdAndUpdate(deleteStock.catalog, {
      stock: stockCatalog,
    });

    await deleteStock.stockOut.map((stockOutId) => {
      StockOut.findByIdAndRemove(stockOutId);
    });
    await deleteStock.stockAdd.map((stockAddId) => {
      StockAdd.findByIdAndRemove(stockAddId);
    });

    return Branch.findById(deleteStock.branch)
      .populate({
        path: 'place',
        populate: { path: 'bill' },
      })
      .populate({
        path: 'stock',
        populate: ['catalog', 'stockAdd', 'stockOut'],
      });
  },
  createStockAdd: async (
    parent,
    { stockId, buy, amount },
    { accessToken },
    info
  ) => {
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

    const createStockAdd = await StockAdd.create({
      stock: stockId,
      buy,
      amount,
    });

    const stock = await Stock.findById(stockId);
    const newStockAdd = [...stock.stockAdd, createStockAdd.id];
    const newRemain = stock.remain + buy;
    const newAmount = stock.amount + amount;
    await Stock.findByIdAndUpdate(stockId, {
      stockAdd: newStockAdd,
      remain: newRemain,
      amount: newAmount,
    });

    return Branch.findById(stock.branch)
      .populate({
        path: 'place',
        populate: { path: 'bill' },
      })
      .populate({
        path: 'stock',
        populate: ['catalog', 'stockAdd', 'stockOut'],
      });
  },
  createStoreProductCatalog: async (
    parent,
    { name, th },
    { accessToken },
    info
  ) => {
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

    const storeProductCatalog = await StoreProductCatalog.findOne({ name });
    if (storeProductCatalog)
      throw new Error('StoreProductCatalog already exsit');

    return StoreProductCatalog.create({ name, th });
  },
  deleteStoreProductCatalog: async (parent, { id }, { accessToken }, info) => {
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

    const deleteStoreProductCatalog = await StoreProductCatalog.findByIdAndRemove(
      id
    );

    if (deleteStoreProductCatalog.storeProducts) {
      await deleteStoreProductCatalog.storeProducts.map(async (product) => {
        await StoreProduct.findByIdAndRemove(product);
      });
    }

    return deleteStoreProductCatalog;
  },
  createStoreProduct: async (
    parent,
    { name, stockOutDetail, price, pictureUrl, package, catalogId },
    { accessToken },
    info
  ) => {
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

    const checkStoreProduct = await StoreProduct.findOne({ name });
    if (checkStoreProduct) throw new Error('StoreProduct already exsit');

    const createStoreProduct = await StoreProduct.create({
      name,
      stockOutDetail: stockOutDetail ? stockOutDetail : null,
      pictureUrl,
      price,
      package: package ? package : 0,
      catalog: catalogId,
    });

    const returnStoreProduct = await StoreProduct.findById(
      createStoreProduct.id
    ).populate({ path: 'catalog' });

    const updateStoreProduct = await StoreProductCatalog.findById(catalogId);

    if (!updateStoreProduct.storeProducts) {
      await StoreProductCatalog.findByIdAndUpdate(catalogId, {
        storeProducts: [createStoreProduct.id],
      });
    } else {
      await StoreProductCatalog.findByIdAndUpdate(catalogId, {
        storeProducts: [
          ...updateStoreProduct.storeProducts,
          createStoreProduct.id,
        ],
      });
    }
    return returnStoreProduct;
  },
  updateStoreProduct: async (parent, arg, { accessToken }, info) => {
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

    const { id } = arg;

    const storeProduct = await StoreProduct.findById(id);

    const newData = {
      name: arg.name ? arg.name : storeProduct.name,
      price: arg.price ? arg.price : storeProduct.price,
      pictureUrl: arg.pictureUrl ? arg.pictureUrl : storeProduct.pictureUrl,
      package: arg.package ? arg.package : storeProduct.package,
      catalog: arg.catalogId ? arg.catalogId : storeProduct.catalog,
    };

    const updateStoreProduct = await StoreProduct.findByIdAndUpdate(
      id,
      newData
    );

    const returnStoreProduct = await StoreProduct.findById(id).populate({
      path: 'catalog',
    });

    return returnStoreProduct;
  },
  deleteStoreProduct: async (parent, { id }, { accessToken }, info) => {
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
    const deleteStoreProduct = await StoreProduct.findByIdAndRemove(id);

    const updateStoreProductCatalog = await StoreProductCatalog.findById(
      deleteStoreProduct.catalog
    );

    const newStoreProducts = updateStoreProductCatalog.storeProducts.filter(
      (product) => product.toString() !== id.toString()
    );

    await StoreProductCatalog.findByIdAndUpdate(deleteStoreProduct.catalog, {
      storeProducts: newStoreProducts,
    });

    return deleteStoreProduct;
  },
  createOnlineProductCatalog: async (
    parent,
    { name, th },
    { accessToken },
    info
  ) => {
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

    const onlineProductCatalog = await OnlineProductCatalog.findOne({ name });
    if (onlineProductCatalog)
      throw new Error('OnlineProductCatalog already exsit');

    return OnlineProductCatalog.create({ name, th });
  },
  deleteOnlineProductCatalog: async (parent, { id }, { accessToken }, info) => {
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

    const deleteOnlineProductCatalog = await OnlineProductCatalog.findByIdAndRemove(
      id
    );

    if (deleteOnlineProductCatalog.onlineProducts) {
      await deleteOnlineProductCatalog.onlineProducts.map(async (product) => {
        await OnlineProduct.findByIdAndRemove(product);
      });
    }

    return deleteOnlineProductCatalog;
  },
  createOnlineProduct: async (
    parent,
    { name, stockOutDetail, price, pictureUrl, package, catalogId },
    { accessToken },
    info
  ) => {
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

    console.log('online run');
    const checkOnlineProduct = await OnlineProduct.findOne({ name });
    if (checkOnlineProduct) throw new Error('OnlineProduct already exsit');

    const createOnlineProduct = await OnlineProduct.create({
      name,
      stockOutDetail: stockOutDetail ? stockOutDetail : null,
      pictureUrl,
      price,
      package: package ? package : 0,
      catalog: catalogId,
    });

    const updateOnlineProduct = await OnlineProductCatalog.findById(catalogId);

    if (!updateOnlineProduct.onlineProducts) {
      await OnlineProductCatalog.findByIdAndUpdate(catalogId, {
        onlineProducts: [createOnlineProduct.id],
      });
    } else {
      await OnlineProductCatalog.findByIdAndUpdate(catalogId, {
        onlineProducts: [
          ...updateOnlineProduct.onlineProducts,
          createOnlineProduct.id,
        ],
      });
    }

    const returnOnlineProduct = await OnlineProduct.findById(
      createOnlineProduct.id
    ).populate({ path: 'catalog' });

    return returnOnlineProduct;
  },
  updateOnlineProduct: async (parent, arg, { accessToken }, info) => {
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

    const { id } = arg;

    const onlineProduct = await OnlineProduct.findById(id);

    const newData = {
      name: arg.name ? arg.name : onlineProduct.name,
      price: arg.price ? arg.price : onlineProduct.price,
      pictureUrl: arg.pictureUrl ? arg.pictureUrl : onlineProduct.pictureUrl,
      package: arg.package ? arg.package : onlineProduct.package,
      catalog: arg.catalogId ? arg.catalogId : onlineProduct.catalog,
    };

    const updateOnlineProduct = await OnlineProduct.findByIdAndUpdate(
      id,
      newData
    );

    const returnOnlineProduct = await OnlineProduct.findById(id).populate({
      path: 'catalog',
    });

    return returnOnlineProduct;
  },
  deleteOnlineProduct: async (parent, { id }, { accessToken }, info) => {
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
    const deleteOnlineProduct = await OnlineProduct.findByIdAndRemove(id);

    const updateOnlineProductCatalog = await OnlineProductCatalog.findById(
      deleteOnlineProduct.catalog
    );

    const newOnlineProducts = updateOnlineProductCatalog.onlineProducts.filter(
      (product) => product.toString() !== id.toString()
    );

    await OnlineProductCatalog.findByIdAndUpdate(deleteOnlineProduct.catalog, {
      onlineProducts: newOnlineProducts,
    });

    return deleteOnlineProduct;
  },
  createOrderItemFromStoreOrder: async (
    parent,
    { tableId, orderItem, branchId },
    context,
    info
  ) => {
    // Convert cartItems to orderItems

    const convertCartToOrder = async () => {
      return Promise.all(
        orderItem.map(async (item) => {
          // Check OrderItem from Table
          const table = await Table.findById(tableId).populate({
            path: 'items',
            populate: 'storeProduct',
          });

          const existIndex = table.items.findIndex((tableItem) => {
            return tableItem.storeProduct.id === item.productId;
          });

          const product = await StoreProduct.findById(item.productId);
          let orderItem;
          if (existIndex > -1) {
            const oldOrderItem = await OrderItem.findById(
              table.items[existIndex].id
            );

            orderItem = await OrderItem.findByIdAndUpdate(
              table.items[existIndex].id,
              {
                quantity: oldOrderItem.quantity + item.quantity,
              }
            );
          } else {
            orderItem = await OrderItem.create({
              storeProduct: item.productId,
              quantity: item.quantity,
              state: 'waiting',
              branch: branchId,
            });
            await StoreProduct.findByIdAndUpdate(item.productId, {
              sales: [...product.sales, orderItem.id],
            });
          }

          if (product.stockOutDetail) {
            product.stockOutDetail.map(async (stockOut) => {
              const stock = await Stock.findOne({
                branch: branchId,
                name: stockOut.name,
              });

              let createStockOut;
              if (stock.remain <= 0) {
                createStockOut = await StockOut.create({
                  stock: stock.id,
                  out: stockOut.out * item.quantity,
                  cost: 0,
                });
              } else {
                createStockOut = await StockOut.create({
                  stock: stock.id,
                  out: stockOut.out * item.quantity,
                  cost:
                    (stock.amount / stock.remain) *
                    stockOut.out *
                    item.quantity,
                });
              }

              const newRemain = stock.remain - createStockOut.out;
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

          const oldOrderItem = await OrderItem.findById(orderItem.id).populate({
            path: 'storeProduct',
          });

          let returnOrder = oldOrderItem;

          returnOrder.quantity = item.quantity;
          return returnOrder;
        })
      );
    };
    // Create order
    const orderItemsArray = await convertCartToOrder();
    const table = await Table.findById(tableId).populate({
      path: 'place',
    });

    let newItems = table.items;
    let dbItems = [];
    await orderItemsArray.map((orderItem) => {
      dbItems.push({
        id: orderItem.id,
        product: {
          name: orderItem.storeProduct.name,
          pictureUrl: orderItem.storeProduct.pictureUrl,
        },
        quantity: orderItem.quantity,
      });
      if (newItems.includes(orderItem.id)) {
        return;
      } else {
        newItems = [...newItems, orderItem.id];
      }
    });

    let data = {
      createdAt: new Date().getTime(),
      id: tableId,
      user: {
        id: tableId,
        firstName: table.place.table,
      },
      items: dbItems,
    };

    db.ref(`/${branchId}`).push(data);

    await Table.findByIdAndUpdate(tableId, {
      items: newItems,
    });

    return Table.findByIdAndUpdate(tableId)
      .populate({ path: 'items', populate: 'storeProduct' })
      .populate({ path: 'place', populate: 'branch' });
  },
  createOrderItemFromOnlineOrder: async (
    parent,
    { amount, token, return_uri, orderItem, branchId, position },
    { accessToken },
    info
  ) => {
    // Check accessToken
    if (!accessToken) throw new Error('Access Token is not defined');
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
    if (!line) throw new Error('Something wrong while calling Line Profile');

    // Query user from database
    const user = await User.findOne({ lineId: line.userId });

    const userId = user.id;

    // Create charge with omise
    let customer;

    // Credit Card: User use exist card
    // if (amount && cardId && !token && !return_uri) {
    //   const checkCardId = await retrieveCustomer(cardId);

    //   if (!checkCardId) throw new Error('Cannot process payment');

    //   customer = checkCardId;
    // }

    // Credit Card: User use new card
    if (amount && token && !return_uri) {
      const newCustomer = await createCustomer(
        user.email,
        user.firstName,
        token
      );

      if (!newCustomer) throw new Error('Cannot process payment');

      customer = newCustomer;

      // update user'cards field
      const {
        id,
        expiration_month,
        expiration_year,
        brand,
        last_digits,
      } = newCustomer.cards.data[0];

      const newCard = {
        id: newCustomer.id,
        cardInfo: {
          id,
          expiration_month,
          expiration_year,
          brand,
          last_digits,
        },
      };

      // Update cardinfo to user database
      //await User.findByIdAndUpdate(userId, { cards: [newCard, ...user.cards] });
    }
    let charge;
    if (token && return_uri) {
      // Internet Banking
      charge = await createChargeInternetBanking(amount, token, return_uri);
    } else {
      // Credit Card
      charge = await createCharge(amount, customer.id);
    }

    if (!charge) throw new Error('Something went wrong with payment, charge');

    if (charge.status === 'failed') throw new Error('Payment was failed');

    // Convert cartItems to orderItems
    const convertCartToOrder = async () => {
      return Promise.all(
        orderItem.map(async (item) => {
          const orderItem = await OrderItem.create({
            onlineProduct: item.productId,
            quantity: item.quantity,
            state: 'waiting',
            branch: branchId,
          });
          const product = await OnlineProduct.findById(item.productId);

          await OnlineProduct.findByIdAndUpdate(item.productId, {
            sales: [...product.sales, orderItem.id],
          });

          if (product.stockOutDetail) {
            product.stockOutDetail.map(async (stockOut) => {
              const stock = await Stock.findOne({
                branch: branchId,
                name: stockOut.name,
              });

              let createStockOut;
              if (stock.remain <= 0) {
                createStockOut = await StockOut.create({
                  stock: stock.id,
                  out: stockOut.out * item.quantity,
                  cost: 0,
                });
              } else {
                createStockOut = await StockOut.create({
                  stock: stock.id,
                  out: stockOut.out * item.quantity,
                  cost:
                    (stock.amount / stock.remain) *
                    stockOut.out *
                    item.quantity,
                });
              }

              const newRemain = stock.remain - createStockOut.out;
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

          return OrderItem.findById(orderItem.id).populate({
            path: 'onlineProduct',
          });
        })
      );
    };

    const convertCartToOrder2 = async () => {
      return Promise.all(
        orderItem.map(async (item) => {
          const orderItem = await OrderItem.create({
            onlineProduct: item.productId,
            quantity: item.quantity,
            state: 'progressing',
            branch: branchId,
          });

          return OrderItem.findById(orderItem.id).populate({
            path: 'onlineProduct',
          });
        })
      );
    };
    // Create order
    let orderItemsArray;
    if (charge.status === 'successful') {
      orderItemsArray = await convertCartToOrder();
    } else {
      orderItemsArray = await convertCartToOrder2();
    }

    let dbItems = [];
    await orderItemsArray.map((orderItem) => {
      dbItems.push({
        id: orderItem.id,
        product: {
          name: orderItem.onlineProduct.name,
          pictureUrl: orderItem.onlineProduct.pictureUrl,
        },
        quantity: orderItem.quantity,
      });
    });

    const order = await Order.create({
      user: userId,
      branch: branchId,
      amount: amount,
      net: charge.net,
      fee: charge.fee,
      fee_vat: charge.fee_vat,
      position: position,
      items: orderItemsArray.map((orderItem) => orderItem.id),
      chargeId: charge.id,
      status: charge.status,
      authorizeUri: charge.authorize_uri ? charge.authorize_uri : null,
      by: 'omise',
    });

    if (charge.status === 'successful') {
      let data = {
        createdAt: new Date().getTime(),
        id: order.id,
        user: {
          id: userId,
          lineid: user.lineId,
          firstName: user.firstName,
          pictureUrl: user.pictureUrl,
          phone: user.phone,
        },
        items: dbItems,
      };

      db.ref(`/${branchId}`).push(data);
    }

    await User.findByIdAndUpdate(userId, {
      orders: !user.orders ? [order.id] : [...user.orders, order.id],
    });

    // Return order
    return order;
  },
  createOrderFromStoreOrder: async (
    parent,
    { tableId, discount },
    { accessToken },
    info
  ) => {
    const table = await Table.findByIdAndUpdate(tableId)
      .populate({ path: 'items', populate: 'storeProduct' })
      .populate({ path: 'place', populate: 'branch' });

    const place = await Place.findByIdAndUpdate(table.place.id);

    if (place.state === 'Wait') throw new Error('Bill is already created');

    let amount =
      table.items.reduce(
        (sum, item) => sum + item.quantity * item.storeProduct.price,
        0
      ) * 100;

    console.log(amount);
    let discountData = (discount * amount) / 100;
    let net = amount - discountData;

    console.log(discountData);
    console.log(net);

    const order = await Order.create({
      branch: table.place.branch,
      place: table.place.id,
      amount: amount,
      discount: discountData,
      net: net,
      items: table.items.map((orderItem) => orderItem.id),
      status: 'paying',
      by: 'store',
    });

    await Place.findByIdAndUpdate(table.place.id, {
      state: 'Wait',
      order: order.id,
    });

    return Order.findById(order.id)
      .populate({ path: 'place' })
      .populate({ path: 'branch' })
      .populate({ path: 'items', populate: 'storeProduct' });
  },
  clearPlace: async (parent, { placeId, by }, { accessToken }, info) => {
    if (!by) throw new Error('กรุณาเลือกวิธีชำระเงิน');
    const place = await Place.findByIdAndUpdate(placeId, {
      state: 'Open',
      adult: 0,
      children: 0,
      order: undefined,
      bill: undefined,
    });

    await Order.findByIdAndUpdate(place.order, {
      status: 'successful',
      by: by,
    });

    await Table.findByIdAndRemove(place.bill);

    return Place.findById(placeId)
      .populate({ path: 'bill' })
      .populate({ path: 'branch' });
  },
  ordersByDate: async (parent, { startDate, endDate }, context, info) => {
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate({ path: 'items', populate: ['storeProduct', 'onlineProduct'] })
      .populate({ path: 'user' })
      .populate({ path: 'place' })
      .populate({ path: 'branch' });

    return orders;
  },
  saleStoreProduct: async (
    parent,
    { startDate, endDate, branchId },
    { accessToken },
    info
  ) => {
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

    const products = await StoreProduct.find()
      .populate({
        path: 'sales',
        populate: ['branch'],
      })
      .populate({ path: 'catalog' });

    let result = [];
    await products.map((prod) => {
      let filterBranch = prod.sales.filter(
        (orderItem) => orderItem.branch.id === branchId
      );
      let day = [];
      day = filterBranch.filter(
        (orderItem) =>
          orderItem.createdAt > startDate && orderItem.createdAt < endDate
      );

      totalSales = day.reduce((sum, orderItem) => sum + orderItem.quantity, 0);

      result.push({
        id: prod.id,
        ...prod._doc,
        sales: prod.sales,
        totalSales,
        catalog: { id: prod.catalog.id },
      });
    });

    return result;
  },
  saleOnlineProduct: async (
    parent,
    { startDate, endDate, branchId },
    { accessToken },
    info
  ) => {
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

    const products = await OnlineProduct.find({})
      .populate({
        path: 'sales',
        populate: ['branch'],
      })
      .populate({ path: 'catalog' });

    let result = [];
    await products.map((prod) => {
      let filterBranch = prod.sales.filter(
        (orderItem) => orderItem.branch.id === branchId
      );
      let day = [];
      day = filterBranch.filter(
        (orderItem) =>
          orderItem.createdAt > startDate && orderItem.createdAt < endDate
      );

      totalSales = day.reduce((sum, orderItem) => sum + orderItem.quantity, 0);

      result.push({
        id: prod.id,
        ...prod._doc,
        sales: prod.sales,
        totalSales,
        catalog: prod.catalog,
      });
    });

    return result;
  },
};

module.exports = Mutation;
