const { db } = require('../util/firebaseUtil.js');
const axios = require('axios');

exports.getUser = async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) res.send({ message: 'No AccessToken' });
  let line;
  await axios
    .get('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(res => {
      console.log(res.data);
      line = res.data;
    })
    .catch(err => {
      console.log(err);
    });

  const doc = await db
    .collection('users')
    .doc(line.userId)
    .get();

  if (doc.exists) {
    let data = { id: doc.id, ...doc.data() };
    res.send(data);
    return data;
  } else {
    const data = {
      id: 'guess',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      pictureUrl: '',
      state: 'guess',
      address: [],
      products: [],
      carts: [],
      createdAt: ''
    };
    res.send(data);
    return data;
  }
};

exports.getUsers = async (req, res) => {
  const snapshot = await db.collection('users').get();
  const data = snapshot.empty
    ? []
    : snapshot.docs.map(doc => Object.assign(doc.data(), { id: doc.id }));

  res.send(data);
  return data;
};

exports.signinWithAccessToken = async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) res.send({ message: 'No AccessToken' });
  let line;
  await axios
    .get('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(res => {
      console.log(res.data);
      line = res.data;
    })
    .catch(err => {
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
      address: [],
      products: [],
      carts: [],
      createdAt: ''
    };
    res.send(data);
    return data;
  }
  const doc = await db
    .collection('users')
    .doc(line.userId)
    .get();
  if (doc.exists) {
    let data = { id: doc.id, ...doc.data() };
    if (data.pictureUrl !== line.pictureUrl) {
      data.pictureUrl == line.pictureUrl;
    }
    res.send(data);
    return data;
  } else {
    let data = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      pictureUrl: line.pictureUrl,
      state: 'client',
      address: [],
      products: [],
      carts: [],
      createdAt: new Date()
    };
    db.collection('users')
      .doc(line.userId)
      .set(data);
    data.id = line.userId;
    res.send(data);
    return data;
  }
};
