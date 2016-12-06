/**
 * Created by Lukas on 14-Nov-16.
 */
import * as Users from './connectors';
import { pubsub } from './subscriptions';
import { makeExecutableSchema } from 'graphql-tools';

const typedefs = `
type User {
  id: Int!
  firstName: String
  lastName: String
}
type Query {
  users: [User]
}
type Mutation {
  addUser(
    firstName: String!
    lastName: String!
  ): User
}
type Subscription {
 userAdded(firstName: String!): User
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`;

const resolvers = {
    Query: {
        users() {
            console.log('Get Users');
            return Users.getUsers();
        },
    },
    Mutation: {
        addUser: async (root, {firstName, lastName }, context) => {
            console.log('Adding User: ' + firstName + ' ' + lastName);
            const newUser = await Users.addUser(firstName, lastName);
            pubsub.publish('userAdded', newUser);
            return newUser;
        },
    },
    Subscription: {
        userAdded(user) {
            console.log('New Subscription!');
            return user;
        }
    }
};

const executableSchema = makeExecutableSchema({
    typeDefs: typedefs,
    resolvers,
});

export default executableSchema;