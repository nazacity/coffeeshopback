const OmiseFn = require('omise');

const omise = OmiseFn({
  publicKey: 'pkey_test_5jieexf5qxuvhxc3wjk',
  secretKey: 'skey_test_5jieexf5zlztvvib5l7',
});

const retrieveCustomer = (id) => {
  if (!id) return null;
  return new Promise((resolve, reject) => {
    omise.customers.retrieve(id, function (err, res) {
      if (res) {
        resolve(res);
      } else {
        resolve(null);
      }
    });
  });
};

const createCustomer = (email, description, card) => {
  return new Promise((resolve, reject) => {
    omise.customers.create({ email, description, card }, function (err, res) {
      if (res) {
        resolve(res);
      } else {
        resolve(null);
      }
    });
  });
};

const createCharge = (amount, customer) => {
  return new Promise((resolve, reject) => {
    omise.charges.create({ amount, currency: 'thb', customer }, function (
      err,
      res
    ) {
      if (res) {
        resolve(res);
      } else {
        resolve(null);
      }
    });
  });
};

const createChargeInternetBanking = (amount, source, return_uri) => {
  return new Promise((resolve, reject) => {
    omise.charges.create(
      { amount, currency: 'thb', source, return_uri },
      function (err, res) {
        if (res) {
          resolve(res);
        } else {
          resolve(null);
        }
      }
    );
  });
};

module.exports = {
  retrieveCustomer,
  createCustomer,
  createCharge,
  createChargeInternetBanking,
};
