const { gql } = require('apollo-server-express');

const schema = gql`
  type Query {
    # User
    user: User
    users: [User]!
    promotion: [Promotion]!
    # Employee
    employee: Employee
    employees: [Employee]!
    # Order
    orders: [Order]!
    ordersByDay(year: Float, month: Float, day: Float): [Order]!
    ordersByDate(startDate: Float, endDate: Float): [Order]!
    ordersByMonth(year: Float, month: Float): [Order]!
    bestSaleMonthly(year: Float, month: Float): [StoreProduct]!
    saleDaily(year: Float, month: Float, day: Float): [StoreProduct]!

    # Table
    tableByID(id: ID!): Table
    tables: [Table]
    place(id: ID!): Place
    places: [Place]
    branch: [Branch]

    # StoreProduct
    storeProductCatalog: [StoreProductCatalog]
    storeProduct: [StoreProduct]

    # OnlineProduct
    onlineProductCatalog: [OnlineProductCatalog]
    onlineProduct: [OnlineProduct]

    # Stock
    stockName: [StockName]
    stockCatalog: [StockCatalog]
  }

  type Mutation {
    # User
    signinWithAccessToken(accessToken: String): User
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
    deleteTable(id: ID!): Table
    createBranch(branch: String!): Branch
    deleteBranch(id: ID!): Branch
    createPlace(branchId: ID!, table: String!): Branch
    updatePlaceAndCreateTable(
      placeId: ID!
      adult: Float!
      children: Float!
      package: Float
    ): Branch
    deletePlace(id: ID!): Branch

    # Stock
    createStockCatalog(name: String!, th: String!): StockCatalog
    deleteStockCatalog(id: ID!): StockCatalog
    createStock(
      name: String!
      catalogId: ID!
      branchId: ID!
      pictureUrl: String!
    ): Branch
    updateStock(id: ID!, name: String!, pictureUrl: String!): Branch
    deleteStock(id: ID!): Branch
    createStockAdd(stockId: ID!, buy: Float, amount: Float): Branch

    # StoreProduct
    createStoreProductCatalog(name: String!, th: String!): StoreProductCatalog
    deleteStoreProductCatalog(id: ID!): StoreProductCatalog
    createStoreProduct(
      name: String!
      stockOutDetail: [StockOutDetailInput]
      price: Float!
      pictureUrl: String!
      catalogId: ID!
    ): StoreProduct
    updateStoreProduct(
      id: ID!
      name: String
      price: Float
      pictureUrl: String
      catalogId: ID
    ): StoreProduct
    deleteStoreProduct(id: ID!): StoreProduct

    # OnlineProduct
    createOnlineProductCatalog(name: String!, th: String!): OnlineProductCatalog
    deleteOnlineProductCatalog(id: ID!): OnlineProductCatalog
    createOnlineProduct(
      name: String!
      stockOutDetail: [StockOutDetailInput]
      price: Float!
      pictureUrl: String!
      catalogId: ID!
    ): OnlineProduct
    updateOnlineProduct(
      id: ID!
      name: String
      price: Float
      pictureUrl: String
      catalogId: ID
    ): OnlineProduct
    deleteOnlineProduct(id: ID!): OnlineProduct

    # Store Order
    createOrderItemFromStoreOrder(
      tableId: ID!
      orderItem: [OrderItemInput]
      branchId: ID!
    ): Table

    # Online Order
    createOrderItemFromOnlineOrder(
      amount: Float!
      token: String
      return_uri: String
      orderItem: [OrderItemInput]
      branchId: ID!
    ): Order
    updateOrder(id: ID!, status: String, discount: Float): Order
    cancelOrderItemByID(orderId: String!, orderItemId: String!): Order
    doneOrderItemByID(orderItemId: String!): OrderItem
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
    orders: [Order]!
    cards: [Card]!
    createdAt: Float
    table: Table
  }

  type Promotion {
    id: ID!
    title: String!
    detail: String!
    pictureUrl: String!
    price: Float!
  }

  type Table {
    id: ID!
    place: Place
    adult: Float
    children: Float
    orders: [OrderItem]
    discount: Float
    total: Float
    net: Float
    createdAt: Float
  }

  input OrderItemInput {
    productId: ID!
    quantity: Float!
  }

  enum State {
    admin
    employee
    client2
    client1
    client0
    guess
  }

  type StoreProductCatalog {
    id: ID!
    name: String
    th: String
    storeProducts: [StoreProduct]
  }

  type StoreProduct {
    id: ID!
    name: String!
    price: Float!
    stockOutDetail: [StockOutDetail]
    pictureUrl: String!
    package: Float!
    catalog: StoreProductCatalog
    sales: [OrderItem]
    totalSales: Float
  }

  type OnlineProductCatalog {
    id: ID!
    name: String
    th: String
    onlineProducts: [OnlineProduct]
  }

  type OnlineProduct {
    id: ID!
    name: String!
    price: Float!
    stockOutDetail: [StockOutDetail]
    pictureUrl: String!
    package: Float!
    catalog: OnlineProductCatalog
    sales: [OrderItem]
    totalSales: Float
  }

  type StockOutDetail {
    name: String!
    out: Float!
  }

  input StockOutDetailInput {
    name: String!
    out: Float!
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
    table: Table
    by: HowToPay
    items: [OrderItem]!
    createdAt: Float
    authorizeUri: String
  }

  enum HowToPay {
    cash
    omise
  }

  type Branch {
    id: ID!
    branch: String!
    place: [Place]
    stock: [Stock]
    position: Coords
  }

  type Coords {
    lat: String!
    lng: String!
  }

  type Place {
    id: ID!
    branch: Branch!
    table: String!
    state: String!
    adult: Int!
    children: Int!
    package: Int!
    bill: Table
  }

  type StockCatalog {
    id: ID!
    name: String
    th: String
    stock: [Stock]
  }

  type Stock {
    id: ID!
    pictureUrl: String!
    name: String!
    catalog: StockCatalog
    branch: Branch
    remain: Float
    amount: Float
    stockAdd: [StockAdd]
    stockOut: [StockOut]
  }

  type StockName {
    id: ID!
    name: String!
  }

  type StockAdd {
    id: ID!
    stock: Stock
    buy: Float
    amount: Float
    createdAt: Float
  }

  type StockOut {
    id: ID!
    stock: Stock
    out: Float
    cost: Float
    createdAt: Float
  }

  type OrderItem {
    id: ID!
    onlineProduct: OnlineProduct
    storeProduct: StoreProduct
    quantity: Int!
    cost: Float
    state: String!
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
    branch: Branch
    state: String
    position: String
    pin: String
    createdAt: Float
  }
`;

module.exports = schema;
