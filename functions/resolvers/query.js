const axios = require('axios');

const Query = {
  user: async (parent, args, { accessToken }, info) => {
    //console.log('accessToken', accessToken);
    const getuser = await axios.post(
      'https://us-central1-coffeecafesho.cloudfunctions.net/firestore/user',
      {
        accessToken
      }
    );
    return getuser.data;
  },
  users: async (parent, args, context, info) => {
    const users = await axios.get(
      'https://us-central1-coffeecafesho.cloudfunctions.net/firestore/users'
    );
    return users.data;
  }
};

module.exports = Query;
