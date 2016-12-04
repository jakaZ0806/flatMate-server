import * as Users from './connectors';
import { pubsub } from './subscriptions';


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
        pubsub.publish('userAdded', newUser);
      return newUser;
    },
  },
    Subscription: {
      userAdded(user) {
          return user;
      }
    }
};

export default resolvers;