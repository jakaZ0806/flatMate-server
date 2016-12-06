/**
 * Created by Lukas on 15-Nov-16.
 */
import express from 'express';

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import bodyParser from 'body-parser';

import { createServer } from 'http';
import { SubscriptionServer  } from 'subscriptions-transport-ws';
import { subscriptionManager } from './data/subscriptions';

import schema from './data/schema';

const WS_PORT = 8080;
const GRAPHQL_PORT = 3050;

const graphQLServer = express();

/*
const executableSchema = makeExecutableSchema({
    typeDefs: typedefs,
    resolvers: resolvers,
});
*/

graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress({
    schema,
    context: {}, //at least(!) an empty object
}));

graphQLServer.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
}));

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

new SubscriptionServer ({ subscriptionManager }, httpServer);