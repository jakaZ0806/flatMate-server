/**
 * Created by Lukas on 15-Nov-16.
 */
import express from 'express';

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import bodyParser from 'body-parser';

import { createServer } from 'http';
import { SubscriptionServer  } from 'subscriptions-transport-ws';
import { subscriptionManager } from './data/subscriptions';
import { apiRoutes } from './data/auth';
import expressjwt from 'express-jwt';

import mongoose from 'mongoose';

import { toggleTimer } from "./data/timeConnector";

import schema from './data/schema';

const WS_PORT = 8080;
const GRAPHQL_PORT = 3050;

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};

const graphQLServer = express();
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/testDB');

graphQLServer.use(bodyParser.urlencoded({ extended: true }));
graphQLServer.use(allowCrossDomain);


//Routes for Authorisation: Register User, Login
graphQLServer.use('/auth', apiRoutes);

//Use JWT for Authentication
graphQLServer.use(expressjwt({
    secret: 'psssst-secret',
    credentialsRequired: false
}));

graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress((req) => ({
    schema,
    rootValue: {user: req.user,
                test: 'test'},
    context: {}
})));

graphQLServer.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
}));


//START GraphQL Server
graphQLServer.listen(GRAPHQL_PORT, () => console.log(
    `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}/graphql`
));

//Subscription WS Server
const httpServer = createServer((request, response) => {
    response.writeHead(404);
    response.end();
});

httpServer.listen(WS_PORT, () => console.log(
    `Websocket-Server is now running on http://localhost:${WS_PORT}`
));

new SubscriptionServer ({
    onConnect: async (connectionParams) => {
        // Implement if you need to handle and manage connection
    },subscriptionManager: subscriptionManager }, {server: httpServer, path: '/' });

//Start the Timer for Subscription Time-Messages
toggleTimer();