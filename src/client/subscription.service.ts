import { createClient } from 'graphql-ws'
import WebSocket from 'ws'; // Importa la implementación de WebSocket

process.loadEnvFile()
let urlwsocket = process.env.URLWS ?? '';;

export class SubscriptionService {

    // Crea un cliente de WebSocket
    client = createClient({
        url: urlwsocket,
        webSocketImpl: WebSocket
    });

    // Función para iniciar la suscripción
    async subscribeToData(cedula:string) {
        const unsubscribe = await this.client.subscribe(
            {
              query: `
                subscription($cedula: String!) {
                  nuevoEvento(cedula: $cedula) {
                    id
                    mensaje
                  }
                }
              `,
              variables: { cedula }, // Pasa la cédula como variable
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

let _SubscriptionService = new SubscriptionService();

_SubscriptionService.subscribeToData('26728159');

