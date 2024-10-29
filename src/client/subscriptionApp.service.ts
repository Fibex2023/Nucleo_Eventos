import { createClient, Client } from 'graphql-ws';
import WebSocket from 'ws';
// import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
//dotenv.config();

let urlwsocket = process.env.URLWS ?? 'ws://localhost:4001/';

export class SubscriptionService {
  // Crea un cliente de WebSocket
  client: Client = createClient({
    url: urlwsocket,
    webSocketImpl: WebSocket
  });

  // Almacenar la función de desuscripción
  private unsubscribe: (() => void) | undefined;

  // Función para iniciar la suscripción
  subscribeToData(id: string) {
    this.unsubscribe = this.client.subscribe(
      {
        query: `
          subscription($id: String!) {
            SendMsgApp(id: $id) {
              destinatario
              tipo_mensaje
              mensaje
            }
          }
        `,
        variables: { id }, // Pasa el app como variable
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
  }

  // Función para cancelar la suscripción
  unsubscribeFromData() {
    if (this.unsubscribe) {
      this.unsubscribe();
      console.log('Desuscripción completada');
    } else {
      console.log('No hay suscripción activa para cancelar');
    }
  }
}

let _SubscriptionService = new SubscriptionService();
_SubscriptionService.subscribeToData('13457626');

// Ejemplo de uso del método unsubscribe 
// setTimeout(() => {
//  _SubscriptionService.unsubscribeFromData();
// }, 60000); // Desuscribirse después de 60 segundos
