const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const axios = require('axios');
const mongoose = require('mongoose');

const schema = require('./schema');
const resolvers = require('./resolvers');

const DB_USERNAME = 'nazacity';
const DB_PASSWORD = 'CvzelCmkBZpwfQO6';
const DB_NAME = 'ecommerce';

// const gqlServer = () => {
//   const app = express();
//   mongoose
//     .connect(
//       `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@graphql-basic-zy4vi.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
//       {
//         useUnifiedTopology: true,
//         useFindAndModify: false,
//         useNewUrlParser: true,
//       }
//     )
//     .then(() => {
//       const apolloServer = new ApolloServer({
//         typeDefs: schema,
//         resolvers,
//         context: async ({ req }) => {
//           // Check token from headers
//           const accessToken = req.headers.authorization || '';

//           return { accessToken };
//         },
//         introspection: true,
//         playground: true,
//       });

//       apolloServer.applyMiddleware({ app, path: '/', cors: true });
//     })
//     .catch((err) => console.log(err));
//   return app;
// };

const gqlServer = () => {
  const app = express();
  mongoose.connect(
    `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@graphql-basic-zy4vi.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
    {
      useUnifiedTopology: true,
      useFindAndModify: false,
      useNewUrlParser: true,
    }
  );

  const apolloServer = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: async ({ req }) => {
      // Check token from headers
      const accessToken = req.headers.authorization || '';

      return { accessToken };
    },
    introspection: true,
    playground: true,
  });

  apolloServer.applyMiddleware({ app, path: '/', cors: true });

  return app;
};

module.exports = gqlServer;
