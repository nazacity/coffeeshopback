const axios = require('axios');

const Mutation = {
  signinWithAccessToken: async (parent, { accessToken }, context, info) => {
    const user = await axios.post(
      'https://us-central1-coffeecafesho.cloudfunctions.net/firestore/signinwithaccesstoken',
      {
        accessToken
      }
    );
    return user.data;
  }
};

module.exports = Mutation;
