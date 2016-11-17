import * as Users from './connectors';


const resolvers = {
  Query: {
      users() {
      console.log('Get Users');
      return Users.getUsers();
      },
  },
  Mutation: {
    addUser: async (root, {firstName, lastName }, context) => {
      console.log('adding User: ' + firstName + ' ' + lastName);
      const newUser = await Users.addUser(firstName, lastName);
      return newUser;
    },
  },
};

export default resolvers;