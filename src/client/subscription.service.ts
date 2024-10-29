import { createClient } from 'graphql-ws'
import WebSocket from 'ws'; // Importa la implementación de WebSocket

// process.loadEnvFile()
let urlwsocket = process.env.URLWS ?? 'http://localhost:4001/';;

export class SubscriptionService {

    // Crea un cliente de WebSocket
    client = createClient({
        url: urlwsocket,
        webSocketImpl: WebSocket
    });

    // Función para iniciar la suscripción
    async subscribeToData(id:string) {
        const unsubscribe = await this.client.subscribe(
            {
              query: `
                subscription($id: String!) {
                  nuevoEvento(id: $id) {
                    idUnicoConect
                    app
                    tipo_mensaje
                    mensaje
                  }
                }
              `,
              variables: { id }, // Pasa la cédula como variable
            },
            {
              next(data) {
                console.log('Datos recibidos:', data);
              },
              error(err) {
                console.error('Error en la suscripción:', err);
              },
              complete() {
                console.log('Suscripción completada');
              },
            }
          );
        
          // Puedes llamar a unsubscribe() para detener la suscripción cuando ya no la necesites
        }
}

let i = 0;
const _SubscriptionService: SubscriptionService[] = [];

const intervalId = setInterval(() => {
  if (i < 20000) {
    _SubscriptionService.push(new SubscriptionService());
    _SubscriptionService[i].subscribeToData('1345762' + i);
    console.log(`Suscripción ${i} iniciada`);
    i++;
  } else {
    clearInterval(intervalId);
    console.log('Todas las suscripciones iniciadas');
  }
}, 1000); // 1000 milisegundos = 1 segundo
