const store = require('express')();
const cors = require('cors');
const {
  getUser,
  getUsers,
  signinWithAccessToken
} = require('./firestorehandler/userhandler');

store.use(cors());

// Users
store.get('/users', getUsers);
store.post('/user', getUser);
store.post('/signinwithaccesstoken', signinWithAccessToken);

module.exports = store;
