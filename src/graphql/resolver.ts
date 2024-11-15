import { PubSub } from 'graphql-subscriptions';
import { JSONBuffer } from '../services/Buffer.js';
import { clsApiHttp } from '../services/ApiHttp.js';

const pubsub = new PubSub();
export const activeSubscriptions = new Map<any, any>(); // Mapear identificadores de suscripciones a clientes
export const FileBuffer = 'buffer.json';
export const _JSONBuffer = new JSONBuffer(FileBuffer)

export const resolvers = {
  Query: {
    hello: () => '¡Hola, mundo!', 
    Conectados: () => `Conectados ${JSON.stringify(Array.from(activeSubscriptions.values()))}`, 
    GetBuffer: () => `GetBuffer ${JSON.stringify(_JSONBuffer.getAllData())}`, 
    sendMessage: (_: any, { abonado, idUnicoConect, tipo_mensaje, app, mensaje }: 
      { abonado: string, idUnicoConect: string, tipo_mensaje: string, app: string, mensaje: string }) => {
      // Aquí puedes añadir la lógica para manejar estos parámetros
      let evento = {
        idUnicoConect: idUnicoConect,
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
      subscribe: (_:any, { id }: { id: string }, context: any) => {  
        return pubsub.asyncIterator(`EVENTO_${id}`);
      },
    },
    SendMsgApp: {
      subscribe: (_:any, { app }: { app: string }, context: any) => {  
        return pubsub.asyncIterator(`EVENTO_${app}`);
      },
    }
  },
};

// Función para publicar un mensaje
export const sendMessage = (message: string) => {
  pubsub.publish('MESSAGE_SENT', { messageSent: message });
};

const findSubscriptionByValue = (value: any): any | null => {
  for (let [id, context] of activeSubscriptions.entries()) {
    if (Object.values(context).includes(value)) {
      activeSubscriptions.get(id).TimerUltMensaje = Date.now()
      console.log(activeSubscriptions.get(id))
      return { id, context, obj:activeSubscriptions.get(id) };
    }
  }
  return null;
}
// Cuando se produzca un nuevo evento, publica el evento en el canal correspondiente
export const publicarEvento = (id: string, evento: any) => {
  // aqui devo devolver una promesa porque sino tengo esa cedula suscrita entonce no mando nada 
  // si la cédula esta suscrita entonces le mando
  // Control de clientes suscritos con un maps verifico en el maps si lo tengo conectado  
  // Debo buscar en el Maps ese valos por ahora lo tengo en un for
  const subscription = findSubscriptionByValue(id);   // El objeto subscription deberia tener el metodo API Propio de EL
  if (subscription) {
    console.log("La cedula a la que le intentas enviar si está conetado")
    console.log(`EVENTO_${id}`);
    console.log(evento.tipo_mensaje);
    console.log(evento);
    
    switch (evento.tipo_mensaje) {
      case "api":
        // Tomo el Mensaje
        //'{ "metodo": "get", "url": "https://httpbin.org/get" }'
        const jsonObject = JSON.parse(evento.mensaje);
        console.log("PASE1....")

        switch (jsonObject.metodo.toUpperCase()) {
          case "GET": 
            console.log("PASE....")
            const clsApiHttp: clsApiHttp = subscription.obj.clsApiHttp            
            clsApiHttp.get(jsonObject.url)
                  .then(response => {
                    evento.mensaje =  JSON.stringify(response.data)
                    pubsub.publish(`EVENTO_${id}`, {nuevoEvento:evento });
                    console.log("aqui....")
                    console.log(response.data)
                    console.log("AQUI2....")
                  })
                  .catch(error => {
                    pubsub.publish(`EVENTO_${id}`, {"Error": error});
                    console.error(error)
                  });
            break;
          case "POST":
          case "PUT":
          default:
            break;
        }
        break;
    
      default:
        console.log("PASE2....")
        pubsub.publish(`EVENTO_${id}`, { nuevoEvento: evento });
        break;
    }
    // Aqui debo tener un select dependiento del tipo de mensaje, por ejemplo API DEbe llamar a la api y darle la respuesta al cliente.

    
  } else {
    // Agrego en el buffer
    // El buffer se va a mantener por 24H         
    if (id != undefined && evento != undefined) 
    {      
      _JSONBuffer.addData({ id: id, message: evento });
    }

  }
  
  
}