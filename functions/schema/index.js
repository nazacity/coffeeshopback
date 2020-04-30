const { gql } = require('apollo-server-express');

const schema = gql`
  type Query {
    user: User
    users: [User]!
  }

  type Mutation {
    signinWithAccessToken(token: String): User
  }
  scalar Date

  type User {
    id: ID!
    firstName: String
    lastName: String
    email: String
    phone: String
    picturUrl: String
    state: State
    address: [Address]
    products: [Product]
    carts: [CartItem]!
    createdAt: Date!
  }

  enum State {
    admin
    employee
    client
    guesss
  }

  type Product {
    id: ID!
    description: String!
    price: Float!
    imageUrl: String!
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
    Province: String
    zip: String
  }
`;

module.exports = schema;
