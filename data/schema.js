/**
 * Created by Lukas on 14-Nov-16.
 */
import * as Users from './connectors';
import { getTime } from './timeConnector'
import { pubsub } from './subscriptions';
import { makeExecutableSchema } from 'graphql-tools';
import User from './models/user'

const typedefs = `
type User {
  id: Int!
  firstName: String
  lastName: String
  username: String
  password: String
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
    username: String!
    password: String!
  ): User
}
type Subscription {
 userAdded: User
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
            var users = User.find({}, function(err, users) {
                return users;
            });
            return users;
        },
        getTime() {
            return Date.now();
        }
    },
    Mutation: {
        addUser: async (root, {firstName, lastName, username, password }, context) => {
            console.log('Adding User: ' + firstName + ' ' + lastName);
            const newUser = await Users.addUser(firstName, lastName, username, password);
            //Publish Event for Subscriptions
            pubsub.publish('userAdded', newUser);
            return newUser;
        },
    },
    Subscription: {
        userAdded(user) {
            return user;
        },
        timeSub(time) {
            return {time:time};
        }
    }
};

const executableSchema = makeExecutableSchema({
    typeDefs: typedefs,
    resolvers,
});

export default executableSchema;