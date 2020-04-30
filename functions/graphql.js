const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const axios = require('axios');

const schema = require('./schema');
const resolvers = require('./resolvers');

const gqlServer = () => {
  const app = express();

  const apolloServer = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: async ({ req }) => {
      // Check token from headers
      const accessToken = req.headers.authorization || '';

      return { accessToken };
    },
    introspection: true,
    playground: true
  });

  apolloServer.applyMiddleware({ app, path: '/', cors: true });

  return app;
};

module.exports = gqlServer;
