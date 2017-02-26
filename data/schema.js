/**
 * Created by Lukas on 14-Nov-16.
 */
import * as Users from './connectors';
import { toggleTimer } from './timeConnector'
import { getTimerStatus } from './timeConnector'
import { pubsub } from './subscriptions';
import { makeExecutableSchema } from 'graphql-tools';
import User from './models/user'
import jwt from 'jsonwebtoken';

//Error Object to prettify Error Messages on Client
const errorObj = obj => {
    return new Error(JSON.stringify(obj));
};

//If no user Object is present, the request is rejected
const checkUserLogin = function(user) {
    if (!user) {
        throw errorObj({_error: 'Unauthorized.'});
    }
};

const typedefs = `
type User {
  id: String!
  firstName: String
  lastName: String
  username: String
  password: String
  admin: Boolean
  friends: [User]
}
type Time {
    time: Float!
}

type authResponse {
    success: Boolean
    error: String
    token: String
    }
type Query {
  users: [User]
  getTime: Time
  user(username: String, id: String): User
  password(username: String!): String
  getJWT(username: String!, password: String!): authResponse
}
type Mutation {
  addUser(
    firstName: String!
    lastName: String!
    username: String!
    password: String!
  ): User
  toggleTimer: Boolean
  deleteUser(username: String!): User
}
type Subscription {
 userChanged: User
 timeSub: Time
}

type AuthorisationError {
    key: String,
    message: String!
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`;

const resolvers = {
    Query: {
        users: async (root) => {
            console.log('Get Users');
           checkUserLogin(root.user);
            return User.find({}, function (err, users) {
                return users;
            });

        },
        getTime() {
            return Date.now();
        },
        user: async (root, {username, id}) => {
            checkUserLogin(root.user);
            if (id) {
                return await Users.findById(id);
            }
            if (username) {
                return await Users.findOne(username);
            }
        },
        password: async (root, {username}) => {
            if (root.user.admin || root.user.username === username) {
                const user = await Users.findOne(username);
                if (user) {
                    return user.password;
                }
                else {
                    return 'User not found!'
                }
            }
            else {
                return 'Not Authorized! Only visible for admins or the user himself.';
            }
        },
        getJWT: async (root, {username, password}) => {
            console.log(username + ' ' + password);
            //create response object
            var response = {};
            // find the user
           await User.findOne({
                username: username
            }, function(err, user) {

                if (err) throw err;

                if (!user) {
                    return {
                        success: false,
                        error: 'User not found!',
                        token: null
                    };
                } else if (user) {
                    console.log('user found');
                    // check if password matches
                    if (user.password != password) {
                        return {
                            success: false,
                            error: 'Wrong Password!',
                            token: null
                        }
                    } else {

                        // if user is found and password is right
                        // create a token
                        var token = jwt.sign(user.toObject(), 'psssst-secret', {
                            expiresIn: 1440 // expires in 24 hours
                        });

                        // return the information including token as JSON
                        response =  {
                            success: true,
                            error: '',
                            token: token
                        }

                    }

                }

            });
            return response;
        },

    },
    Mutation: {
        addUser: async (root, {firstName, lastName, username, password }) => {
            checkUserLogin(root.user);
            if (root.user.admin) {
                console.log('Adding User: ' + firstName + ' ' + lastName);
                const newUser = await Users.addUser(firstName, lastName, username, password);
                //Publish Event for Subscriptions
                pubsub.publish('userChanged', newUser);
                return newUser;
            }
            else {
                console.log('Access Denied');
                throw errorObj({_error: 'Unauthorized. Admin Privileges needed.'});
            }
        },
        toggleTimer: async (root) => {
            checkUserLogin(root.user);
                toggleTimer();
                return getTimerStatus();
        },
        deleteUser: async (root, {username}) => {
            checkUserLogin(root.user);
            if (root.user.admin) {
            const user = await Users.deleteUser(username, root.user);
            pubsub.publish('userChanged', user);
            return user;
            }
            else {
                console.log('Access Denied');
                throw errorObj({_error: 'Unauthorized. Admin Privileges needed.'});
            }
        }
    },
    Subscription: {
        userChanged(user) {
            return user;
        },
        timeSub(time) {
            return {time:time};
        }
    },
    User: {
        friends: async (user) => {
            const friends = await Users.getUsersById(user.friends);
            console.log(friends);
            return friends;
        }
    }
};

const executableSchema = makeExecutableSchema({
    typeDefs: typedefs,
    resolvers,
});

export default executableSchema;