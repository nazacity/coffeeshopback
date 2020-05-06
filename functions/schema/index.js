const { gql } = require('apollo-server-express');

const schema = gql`
  type Query {
    user: User
    users: [User]!
    catalogs: [Catalog]!
    product(id: String!): Product
    products: [Product]!
    orders: [Order]!
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
    addToCart(id: ID!, quantity: Float!): CartItem!
    updateCart(id: ID!, quantity: Float!): CartItem!
    deleteCart(id: ID!): CartItem!
    addAddress(
      subdetail: String!
      district: String!
      city: String!
      province: String!
      zip: String!
    ): User
    createOrder(
      amount: Float!
      cardId: String
      token: String
      return_uri: String
    ): Order
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
    carts: [CartItem]!
    orders: [Order]!
    cards: [Card]!
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

  type Order {
    id: ID!
    user: User
    amount: Float
    net: Float
    fee: Float
    fee_vat: Float
    chargeId: String
    status: String
    items: [OrderItem!]
    createdAt: Date
    authorize_uri: String
  }

  type OrderItem {
    id: ID!
    product: Product!
    quantity: Int!
    user: User!
    createdAt: Date!
  }

  type Card {
    id: ID!
    cardInfo: CardInfo
  }

  type CardInfo {
    id: ID!
    expiration_month: Int!
    expiration_year: Int!
    brand: String!
    last_digits: String!
  }
`;

module.exports = schema;
