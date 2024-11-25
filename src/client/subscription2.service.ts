import { createClient } from 'graphql-ws'
import WebSocket from 'ws'; // Importa la implementación de WebSocket

// process.loadEnvFile()
let urlwsocket = process.env.URLWS ?? 'http://localhost:4001/';;
let sendMessageUrl = process.env.SEND_MESSAGE_URL ?? 'http://localhost:4001/'; // URL de tu endpoint GraphQL

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

 
    // Codgido para 
    async  sendMessage(abonado: string, tipo_mensaje: string, app: string, mensaje: string) 
    { const query = ` query 
        SendMessage($abonado: String!, $tipo_mensaje: String!, $app: String!, $mensaje: String!) 
        { sendMessage(abonado: $abonado, tipo_mensaje: $tipo_mensaje, app: $app, mensaje: $mensaje) } 
         `; 
       const variables = { abonado, tipo_mensaje, app, mensaje }; 
       console.log("----------------")
       console.log(sendMessageUrl)
       console.log("----------------")
       try { const response = await fetch(sendMessageUrl, 
            { method: 'POST',
             headers: { 'Content-Type': 'application/json', }, 
             body: JSON.stringify({ query, variables }), }); 
             const result = await response.json(); 
             console.log('Mensaje enviado:', result); 
            } catch (error) { 
                console.error('Error enviando el mensaje:', error); 
            }
    }
}

// ---------------------------
// Suscripcion a los eventos
let _SubscriptionService = new SubscriptionService();
_SubscriptionService.subscribeToData('13457626');

let _SubscriptionService2 = new SubscriptionService();
_SubscriptionService2.subscribeToData('RUxJTlRFUk5FVCBRVUUgU0kgRlVOQ0lPTkEgRklCRVg=');
// --------------------------


// Mando 20 Mensajes de prueba
let i = 0;
const intervalId = setInterval(() => {
  if (i < 2) {
    // Llamar a sendMessage cada segundo con los parámetros especificados
    // Envio individual
    // _SubscriptionService.sendMessage('13457627', `55${i}`, 'averias', `{port: ${i % 5}, l: 6}`);
    // Envio Masivo
    _SubscriptionService.sendMessage('RUxJTlRFUk5FVCBRVUUgU0kgRlVOQ0lPTkEgRklCRVg=', `55${i}`, 'averias', `{port: ${i % 5}, l: 6}`);

    i++;
  } else {
    clearInterval(intervalId);
    console.log('Termine');
  }
}, 1000); // 1000 milisegundos = 1 segundo


