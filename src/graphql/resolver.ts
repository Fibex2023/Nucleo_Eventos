import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

export const resolvers = {
    Query: {
      hello: () => '¡Hola, mundo!',
    },
    Subscription: {
        messageSent: {
          subscribe: () => pubsub.asyncIterator('MESSAGE_SENT'),
        },
      },
};

// Función para publicar un mensaje
export const sendMessage = (message: string) => {
    pubsub.publish('MESSAGE_SENT', { messageSent: message });
  };