const { gql } = require('apollo-server-express');

const schema = gql`
  type Query {
    user: User
    users: [User]!
  }

  type Mutation {
    signinWithAccessToken(accessToken: String): User
    register(
      firstName: String!
      lastName: String!
      email: String!
      phone: String!
      state: String!
    ): User
  }
  scalar Date

  type User {
    id: ID!
    firstName: String
    lastName: String
    email: String
    phone: String
    pictureUrl: String
    state: State
    address: [Address]
    products: [Product]
    carts: [CartItem]!
    createdAt: Date
  }

  enum State {
    admin
    employee
    client2
    client1
    client0
    guess
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    pictureUrl: String!
    user: User!
    createdAt: Date!
  }

  type CartItem {
    id: ID!
    product: Product!
    quantity: Int!
    user: User!
    createdAt: Date!
  }

  type Address {
    id: ID!
    subdetail: String
    district: String
    city: String
    province: String
    zip: String
  }
`;

module.exports = schema;
