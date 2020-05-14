const axios = require('axios');
const User = require('../models/user');
const Product = require('../models/product');
const Catalog = require('../models/catalog');
const CartItem = require('../models/cartItem');
const OrderItem = require('../models/orderItem');
const Order = require('../models/order');
const Promotion = require('../models/promotion');
const Employee = require('../models/employee');

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
        carts: [],
      };
      return data;
    }
    const user = await User.findOne({ lineId: line.userId });

    if (user) {
      if (user.pictureUrl !== line.pictureUrl) {
        await User.findByIdAndUpdate(user.id, {
          ...user,
          pictureUrl: line.pictureUrl,
        });
      }
      const updatedUser = await User.findById(user.id).populate({
        path: 'carts',
        populate: { path: 'product' },
      });

      return updatedUser;
    } else {
      data = {
        lineId: line.userId,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        pictureUrl: line.pictureUrl,
        state: 'client0',
        carts: [],
      };
      return User.create(data);
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
    const user = await User.findOne({ lineId: line.userId }).populate({
      path: 'carts',
      populate: { path: 'product' },
    });
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
      index = await employees.findIndex(
        (data) => data.user.lineId === line.userId
      );
      if (index === -1) {
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
  createCatalog: async (parent, { name, th }, { accessToken }, info) => {
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

    return Catalog.create({ name, th });
  },
  createProduct: async (
    parent,
    { name, description, price, pictureUrl, catalog },
    { accessToken },
    info
  ) => {
    console.log('createProduct run');
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
    const product = await Product.create({
      name,
      description,
      price,
      pictureUrl,
      catalog,
    });
    return product;
  },
  updateProduct: async (
    parent,
    { id, name, description, price, pictureUrl, catalog },
    { accessToken },
    info
  ) => {
    console.log('createProduct run');
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

    const product = await Product.findById(id);
    if (!product) throw new Error('No Product');
    const updateProductInfo = {
      name: name ? name : product.name,
      description: description ? description : product.description,
      price: price ? price : product.price,
      pictureUrl: pictureUrl ? pictureUrl : product.pictureUrl,
      catalog: catalog ? catalog : product.catalog,
    };
    await Product.findByIdAndUpdate(id, updateProductInfo);

    return await Product.findById(id);
  },
  deleteCatalog: async (parent, { id }, { accessToken }, info) => {
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

    return await Catalog.findByIdAndRemove(id);
  },
  deleteProduct: async (parent, { id }, { accessToken }, info) => {
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

    return await Product.findByIdAndRemove(id);
  },
  addToCart: async (parent, { id, quantity }, { accessToken }, info) => {
    // product id
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

    // line id
    const { userId } = line;
    try {
      //Find user who perform add item to cart --> from login
      //const userId = '5e9aade8922c170a88607b62';

      //Check if the new addToCart item is already in user.carts
      const user = await User.findOne({ lineId: userId }).populate({
        path: 'carts',
        populate: { path: 'product' },
      });
      const findCartItemIndex = user.carts.findIndex(
        (cartItem) => cartItem.product.id === id
      );

      //A. The new addToCart item is already in cart
      if (findCartItemIndex > -1) {
        //A.1 Find the cartItem and update database
        user.carts[findCartItemIndex].quantity += quantity;
        await CartItem.findByIdAndUpdate(user.carts[findCartItemIndex].id, {
          quantity: user.carts[findCartItemIndex].quantity,
        });
        //A.2 Find updated cartItem
        const updatedCartItem = await CartItem.findById(
          user.carts[findCartItemIndex].id
        )
          .populate({ path: 'product' })
          .populate({ path: 'user' });

        return updatedCartItem;
      } else {
        //B. The new addToCart item is not in cart
        //B.1 Create new cartItem
        const cartItem = await CartItem.create({
          product: id,
          quantity,
          user: user.id,
        });

        //B.2 find new cartITem
        const newCartItem = await CartItem.findById(cartItem.id)
          .populate({ path: 'product' })
          .populate({ path: 'user' });
        //B.2  Update user.carts

        await User.findByIdAndUpdate(user.id, {
          carts: [...user.carts, newCartItem],
        });

        return newCartItem;
      }
    } catch (err) {
      console.log(err);
    }
  },
  updateCart: async (parent, { id, quantity }, { accessToken }, info) => {
    // cart id
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

    // line id
    const { userId } = line;

    // Find cart from given id
    const cart = await CartItem.findById(id);

    const user = await User.findOne({ lineId: userId }).populate({
      path: 'carts',
      populate: { path: 'product' },
    });

    // Check user owner
    if (cart.user.toString() !== user.id) {
      throw new Error('You are not authorized');
    }

    if (quantity === 0) {
      // Delete cart
      const deletedCart = await CartItem.findByIdAndRemove(id)
        .populate({ path: 'product' })
        .populate({ path: 'user' });
      // Update userCarts
      const updatedUserCarts = user.carts.filter(
        (cartId) => cartId.toString() !== deletedCart.id.toString()
      );
      console.log('userId', user.id);
      await User.findByIdAndUpdate(user.id, { carts: updatedUserCarts });
      return deletedCart;
    } else {
      const findCartItemIndex = user.carts.findIndex(
        (cartItem) => cartItem.id === cart.id
      );
      //A. The new addToCart item is already in cart
      if (findCartItemIndex > -1) {
        //A.1 Find the cartItem and update database
        user.carts[findCartItemIndex].quantity = quantity;
        await CartItem.findByIdAndUpdate(user.carts[findCartItemIndex].id, {
          quantity: user.carts[findCartItemIndex].quantity,
        });
        //A.2 Find updated cartItem
        const updatedCartItem = await CartItem.findById(
          user.carts[findCartItemIndex].id
        )
          .populate({ path: 'product' })
          .populate({ path: 'user' });

        return updatedCartItem;
      } else {
        throw new Error('There is no CartItem');
      }
    }
  },
  deleteCart: async (parent, { id }, { accessToken }, info) => {
    // cart id
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

    // line id
    const { userId } = line;

    // Find cart from given id
    const cart = await CartItem.findById(id);

    // TODO: find userId by request
    //const userId = '5e9aabf3fc6a883b4878133c';

    const user = await User.findOne({ lineId: userId });

    // Check user owner
    if (cart.user.toString() !== user.id) {
      throw new Error('You are not authorized');
    }

    // Delete cart
    const deletedCart = await CartItem.findByIdAndRemove(id)
      .populate({ path: 'product' })
      .populate({ path: 'user' });

    // Update userCarts
    const updatedUserCarts = user.carts.filter(
      (cartId) => cartId.toString() !== deletedCart.id.toString()
    );
    await User.findByIdAndUpdate(user.id, { carts: updatedUserCarts });
    return deletedCart;
  },
  createOrder: async (
    parent,
    { amount, cardId, token, return_uri },
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
    const user = await User.findOne({ lineId: line.userId }).populate({
      path: 'carts',
      populate: { path: 'product' },
    });

    const userId = user.id;

    // Create charge with omise
    let customer;

    // Credit Card: User use exist card
    if (amount && cardId && !token && !return_uri) {
      const checkCardId = await retrieveCustomer(cardId);

      if (!checkCardId) throw new Error('Cannot process payment');

      customer = checkCardId;
    }

    // Credit Card: User use new card
    if (amount && token && !cardId && !return_uri) {
      const newCustomer = await createCustomer(user.email, user.name, token);

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
    console.log(customer);
    console.log('amount', amount);
    let charge;
    if (token && return_uri) {
      // Internet Banking
      charge = await createChargeInternetBanking(amount, token, return_uri);
    } else {
      // Credit Card
      charge = await createCharge(amount, customer.id);
    }
    console.log('charge', charge);

    if (!charge) throw new Error('Something went wrong with payment, charge');

    if (charge.status === 'failed') throw new Error('Payment was failed');
    // Convert cartItems to orderItems
    const convertCartToOrder = async () => {
      return Promise.all(
        user.carts.map((cart) =>
          OrderItem.create({
            product: cart.product,
            quantity: cart.quantity,
            user: cart.user,
          })
        )
      );
    };
    // Create order
    const orderItemsArray = await convertCartToOrder();

    const order = await Order.create({
      user: userId,
      amount: charge.amount,
      net: charge.net,
      fee: charge.fee,
      fee_vat: charge.fee_vat,
      items: orderItemsArray.map((orderItem) => orderItem.id),
      chargeId: charge.id,
      status: charge.status,
      authorize_uri: charge.authorize_uri,
    });

    // Delete carItem from database
    const deleteCartItem = async () => {
      return Promise.all(
        user.carts.map((cart) => CartItem.findByIdAndRemove(cart.id))
      );
    };

    await deleteCartItem();

    // Update user info in database
    await User.findByIdAndUpdate(userId, {
      carts: [],
      orders: !user.orders ? [order.id] : [...user.orders, order.id],
    });

    // Return order
    return await Order.findById(order.id)
      .populate({ path: 'user' })
      .populate({ path: 'items', populate: { path: 'product' } });
  },
  createPromotion: async (
    parent,
    { title, detail, price, products },
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

    const promotion = await Promotion.create({
      title,
      detail,
      pictureUrl: '',
      price,
      products,
    });

    const returnPromotion = await Promotion.findById(promotion.id).populate({
      path: 'products',
    });
    return returnPromotion;
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

    console.log(user.state);
    console.log(user.id);
    console.log(employee.user.id);

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
};

module.exports = Mutation;
