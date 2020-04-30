const { https } = require('firebase-functions');
const gqlServer = require('./graphql');
const store = require('./firestore');

const server = gqlServer();

const graphql = https.onRequest(server);
const firestore1 = https.onRequest(store);

module.exports = {
  graphql,
  firestore1
};
