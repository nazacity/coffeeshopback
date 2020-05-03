const { gql } = require('apollo-server-express');

const schema = gql`
  type Query {
    user: User
    users: [User]!
    catalogs: [Catalog]!
    product(id: String!): Product
    products: [Product]!
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
    createCatalog(name: String!): Catalog
    createProduct(
      name: String!
      description: String!
      price: Float!
      pictureUrl: String!
      catalog: String!
    ): Product
    deleteProduct(id: String): Product
    addAddress(
      subdetail: String!
      district: String!
      city: String!
      province: String!
      zip: String!
    ): User
  }
  scalar Date

  type User {
    id: String!
    lineId: String
    firstName: String
    lastName: String
    email: String
    phone: String
    pictureUrl: String
    state: State
    address: [Address]
    #carts: [CartItem]!
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
    catalog: String!
    createdAt: Date!
  }

  type Catalog {
    name: String!
  }

  type CartItem {
    id: ID!
    product: Product!
    quantity: Int!
    user: User!
    createdAt: Date!
  }

  type Address {
    subdetail: String
    district: String
    city: String
    province: String
    zip: String
  }
`;

module.exports = schema;
