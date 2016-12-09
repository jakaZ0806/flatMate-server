/**
 * Created by Lukas on 14-Nov-16.
 */
import * as Users from './connectors';
import { getTime } from './timeConnector'
import { pubsub } from './subscriptions';
import { makeExecutableSchema } from 'graphql-tools';

const typedefs = `
type User {
  id: Int!
  firstName: String
  lastName: String
}
type Time {
    time: Float!
}

type Query {
  users: [User]
  getTime: Time
}
type Mutation {
  addUser(
    firstName: String!
    lastName: String!
  ): User
}
type Subscription {
 userAdded(firstName: String!): User
 timeSub: Time
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
        getTime() {
            var time = getTimeNow();
            return time;
        }
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
            console.log('Sub-Event: User!');
            return user;
        },
        timeSub() {
            console.log('Sub-Event: Time!');
            return {time:getTime()};
        }
    }
};

const executableSchema = makeExecutableSchema({
    typeDefs: typedefs,
    resolvers,
});

export default executableSchema;