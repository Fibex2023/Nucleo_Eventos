import { PubSub } from 'graphql-subscriptions';
import { JSONBuffer } from '../services/Buffer.js';

const pubsub = new PubSub();
export const activeSubscriptions = new Map<any, any>(); // Mapear identificadores de suscripciones a clientes
export const FileBuffer = 'buffer.json';
export const _JSONBuffer = new JSONBuffer(FileBuffer)

export const resolvers = {
  Query: {
    hello: () => '¡Hola, mundo!', 
    Conectados: () => `Conectados ${JSON.stringify(Array.from(activeSubscriptions.values()))}`, 
    GetBuffer: () => `GetBuffer ${JSON.stringify(_JSONBuffer.getAllData())}`, 
    sendMessage: (_: any, { abonado, tipo_mensaje, app, mensaje }: 
      { abonado: string, tipo_mensaje: string, app: string, mensaje: string }) => {
      // Aquí puedes añadir la lógica para manejar estos parámetros
      let evento = {
        app:app,
        tipo_mensaje: tipo_mensaje,
        mensaje: mensaje 
      }

      publicarEvento(abonado, evento)
      return `Mensaje recibido: ${abonado} - ${tipo_mensaje} - ${app} - ${mensaje}`;
    },
  },
  Subscription: {
    messageSent: {
      subscribe: () => pubsub.asyncIterator('MESSAGE_SENT'),
    },
    nuevoEvento: {
      subscribe: (_:any, { cedula }: { cedula: string }, context: any) => {  
        return pubsub.asyncIterator(`EVENTO_${cedula}`);
      },
    },
  },
};

// Función para publicar un mensaje
export const sendMessage = (message: string) => {
  pubsub.publish('MESSAGE_SENT', { messageSent: message });
};

const findSubscriptionByValue = (value: any): any | null => {
  for (let [id, context] of activeSubscriptions.entries()) {
    if (Object.values(context).includes(value)) {
      return { id, context };
    }
  }
  return null;
}
// Cuando se produzca un nuevo evento, publica el evento en el canal correspondiente
export const publicarEvento = (cedula: string, evento: any) => {
  // aqui devo devolver una promesa porque sino tengo esa cedula suscrita entonce no mando nada 
  // si la cedila esta suscrita entonces le mando
  // Control de clientes suscritos con un maps verifico en el maps si lo tengo conectado  
  // Debo buscar en el Maps ese valos por ahora lo tengo en un for
  const subscription = findSubscriptionByValue(cedula);
  if (subscription) {
    console.log("La cedula a la que le intentas enviar si está conetado")
    console.log(`EVENTO_${cedula}`);
    console.log(evento);
    pubsub.publish(`EVENTO_${cedula}`, { nuevoEvento: evento });
  } else {
    // Agrego en el buffer
    // El buffer se va a mantener por 24H     
    console.log("1La cedula a la que le intentas no está conectada, voy a guardar el Buffer", evento)
    if (cedula != undefined && evento != undefined) 
    {
      console.log("2La cedula a la que le intentas no está conectada, voy a guardar el Buffer", evento)
      _JSONBuffer.addData({ id: cedula, message: evento });
    }

  }
  
  
}