const axios = require('axios');
const User = require('../models/user');
const Product = require('../models/product');
const Catalog = require('../models/catalog');
const CartItem = require('../models/cartItem');

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
  createCatalog: async (parent, { name }, { accessToken }, info) => {
    return Catalog.create({ name });
  },
  createProduct: async (
    parent,
    { name, description, price, pictureUrl, catalog },
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
    const product = await Product.create({
      name,
      description,
      price,
      pictureUrl,
      catalog,
    });
    return product;
  },
  deleteProduct: async (parent, { id }, { accessToken }, info) => {
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
};

module.exports = Mutation;
