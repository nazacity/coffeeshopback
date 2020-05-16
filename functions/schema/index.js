const { gql } = require('apollo-server-express');

const schema = gql`
  type Query {
    user: User
    users: [User]!
    catalogs: [Catalog]!
    product(id: String!): Product
    products: [Product]!
    orders: [Order]!
    promotion: [Promotion]!
    employee: Employee
    employees: [Employee]!
    ordersByDay(year: Float, month: Float, day: Float): [Order]!
    ordersByDate(startDate: Float, endDate: Float): [Order]!
    ordersByMonth(year: Float, month: Float): [Order]!
    bestSaleMonthly(year: Float, month: Float): [Product]!
    saleDaily(year: Float, month: Float, day: Float): [Product]!
  }

  type Mutation {
    signinWithAccessToken(
      accessToken: String
      branch: String
      table: String
    ): User
    register(
      firstName: String!
      lastName: String!
      email: String!
      phone: String!
      state: String!
    ): User
    updateUser(
      id: ID!
      firstName: String
      lastName: String
      email: String
      phone: String
      state: String
    ): User
    createCatalog(name: String!, th: String!): Catalog
    deleteCatalog(id: ID!): Catalog
    createProduct(
      name: String!
      description: String!
      price: Float!
      pictureUrl: String!
      catalog: String!
    ): Product
    updateProduct(
      id: ID!
      name: String
      description: String
      price: Float
      pictureUrl: String
      catalog: String
    ): Product
    deleteProduct(id: ID!): Product
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
    createOrderByOmise(
      amount: Float!
      cardId: String
      token: String
      return_uri: String
      discount: Float
      branch: String
      table: String
    ): Order
    createOrderByCash(
      amount: Float!
      branch: String
      table: String
      discount: Float
    ): Order
    updateOrder(id: ID!, status: String, discount: Float): Order
    createPromotion(
      title: String
      detail: String
      price: Float
      products: [String]!
    ): Promotion
    updatePromotion(
      id: ID!
      title: String
      detail: String
      price: Float
      products: [String]
    ): Promotion
    deletePromotion(id: ID!): Promotion
    updateEmployee(
      id: ID!
      IDcardPictureUrl: String
      state: String
      position: String
      pin: String
    ): Employee
  }

  type User {
    id: ID!
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
    createdAt: Float
    place: Place
  }

  type Promotion {
    id: ID!
    title: String!
    detail: String!
    pictureUrl: String!
    price: Float!
    products: [Product!]!
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
    sales: [OrderItem]!
    createdAt: Float
    totalSales: Float
  }

  type Catalog {
    id: ID!
    name: String!
    th: String!
  }

  type CartItem {
    id: ID!
    product: Product!
    quantity: Int!
    user: User!
    createdAt: Float
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
    discount: Float
    net: Float
    fee: Float
    fee_vat: Float
    chargeId: String
    status: String
    place: Place
    by: HowToPay
    items: [OrderItem]!
    createdAt: Float
    authorizeUri: String
    step: String
  }

  enum HowToPay {
    cash
    omise
  }

  type Place {
    branch: String
    table: String
  }

  type OrderItem {
    id: ID!
    product: Product!
    quantity: Int!
    user: User!
    createdAt: Float
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

  type Employee {
    id: ID!
    user: User!
    IDcardPictureUrl: String
    state: String
    position: String
    pin: String
    createdAt: Float
  }
`;

module.exports = schema;
