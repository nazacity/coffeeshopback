const { https } = require('firebase-functions');
const gqlServer = require('./graphql');
const omisehook = require('./utils/omiseHook');
const server = gqlServer();

const omisewebhook = https.onRequest(omisehook);
const graphql = https.onRequest(server);

module.exports = {
  graphql,
  omisewebhook,
};
