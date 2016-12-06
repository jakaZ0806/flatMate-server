/**
 * Created by Lukas on 02-Dec-16.
 */
import { PubSub, SubscriptionManager } from 'graphql-subscriptions';
import schema from './schema';

const pubsub = new PubSub();
const subscriptionManager = new SubscriptionManager({
    schema,
    pubsub,
    setupFunctions: {
        userAdded: (options, args) => ({
            userAdded: user =>
            user.firstName === args.firstName,
        }),
    },
});

export { subscriptionManager, pubsub };