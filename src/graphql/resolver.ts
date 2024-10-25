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
    nuevoEvento: {
      subscribe: (_:any, { cedula }: { cedula: string }) => {
        return pubsub.asyncIterator(`EVENTO_${cedula}`);
      },
    },
  },
};

// Función para publicar un mensaje
export const sendMessage = (message: string) => {
  pubsub.publish('MESSAGE_SENT', { messageSent: message });
};

// Cuando se produzca un nuevo evento, publica el evento en el canal correspondiente
export const publicarEvento = (cedula: string, evento: any) => {
  // aqui devo devolver una promesa porque sino tengo esa cedula suscrita entonce no mando nada 
  // si la cedila esta suscrita entonces le mando
  pubsub.publish(`EVENTO_${cedula}`, { nuevoEvento: evento });
}