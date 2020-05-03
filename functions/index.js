const { https } = require('firebase-functions');
const gqlServer = require('./graphql');

const server = gqlServer();

const graphql = https.onRequest(server);

module.exports = {
  graphql,
};
