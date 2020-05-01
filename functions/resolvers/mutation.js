const axios = require('axios');

const Mutation = {
  signinWithAccessToken: async (parent, { accessToken }, context, info) => {
    const user = await axios.post(
      'https://us-central1-coffeecafesho.cloudfunctions.net/firestore/signinwithaccesstoken',
      {
        accessToken,
      }
    );
    return user.data;
  },
  register: async (parent, args, { accessToken }, info) => {
    if (!accessToken) throw new Error('Access Token is not defined');
    let line;
    await axios
      .get('https://api.line.me/v2/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        console.log(res.data);
        line = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
    if (!line) throw new Error('Something wrong while calling Line Profile');

    const user = await axios.post(
      'https://us-central1-coffeecafesho.cloudfunctions.net/firestore/register',
      { id: line.userId, ...args }
    );
    if (user.error) {
      throw new Error(user.error.message);
    }
    return user.data;
  },
};

module.exports = Mutation;
