import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

export class SubscriptionService {
  private client: any;
  private urlwsocket = process.env.URLWS ?? 'http://localhost:4001/';
  private sendMessageUrl = process.env.SEND_MESSAGE_URL ?? 'http://localhost:4001/';
  private isConnected: boolean = false;
  private connectPromise: Promise<boolean> | undefined;

  constructor() {
    
  }

  Init() {
    this.connectPromise = this.connect()
  }

  // Método para conectar el cliente WebSocket
  public connect(): Promise<boolean> {
    console.log("Algo pasa2")
    return new Promise((resolve, reject) => {
        console.log("Algo pasa3")
        try {
            this.client = createClient({
                url: this.urlwsocket,
                webSocketImpl: WebSocket,
                on: {
                  connected: () => {
                    this.isConnected = true;
                    console.log('Conectado al servidor WebSocket');
                    resolve(true); // Resuelve la promesa cuando se conecta
                  },
                  closed: () => {
                    this.isConnected = false;
                    console.log('Desconectado del servidor WebSocket. Intentando reconectar...');
                    this.reconnect();
                  },
                  error: (error: unknown) => {
                    if (error instanceof Error) {
                      console.error('Error en la conexión WebSocket:', error);
                      reject(error);
                    } else {
                      console.error('Error desconocido en la conexión WebSocket');
                      this.reconnect()
                      reject(new Error('Error desconocido en la conexión WebSocket'));
                     
                    }
                  },
                },
              }); 
              
              resolve(true)     
        } catch (error) {
            reject(false)
            console.error(error);

        }
      
    });
    console.log("Algo pasa4")
  }

  // Método para reconectar
  private reconnect() {
    setTimeout(() => {
      this.isConnected = false
      this.connectPromise = undefined
      console.log('Intentando reconectar...');
      this.connectPromise = this.connect()
      this.subscribeToData('RUxJTlRFUk5FVCBRVUUgU0kgRlVOQ0lPTkEgRklCRVg=');
      
    }, 15000); // Espera 5 segundos antes de intentar reconectar
  }

  // Función para iniciar la suscripción
  public async subscribeToData(id: string) {
    await this.connectPromise; // Espera a que se conecte
   /* if (!this.isConnected) {
      console.error('No se puede suscribir, no está conectado al servidor.');
      return;
    }*/
    try {
            const unsubscribe = this.client.subscribe(
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
                variables: { id },
            },
            {
                next(data: any) {
                console.log('Datos recibidos:', data);
                },
                error(err: any) {
                console.error('Error en la suscripción:', err);
                },
                complete() {
                    this.isConnected = true
                    console.log('Suscripción completada');
                },
            }
            );
    } catch (error) {
        this.isConnected = false
    }
    

    // Puedes llamar a unsubscribe() para detener la suscripción cuando ya no la necesites
  }

  // Método para enviar mensajes
  public async sendMessage(abonado: string, tipo_mensaje: string, app: string, mensaje: string) {
    const query = `
      mutation SendMessage($abonado: String!, $tipo_mensaje: String!, $app: String!, $mensaje: String!) {
        sendMessage(abonado: $abonado, tipo_mensaje: $tipo_mensaje, app: $app, mensaje: $mensaje)
      }
    `;
    const variables = { abonado, tipo_mensaje, app, mensaje };

    try {
      const response = await fetch(this.sendMessageUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();
      console.log('Mensaje enviado:', result);
    } catch (error) {
      console.error('Error enviando el mensaje:', error);
    }
  }
}

// ---------------------------
let subscriptionService = new SubscriptionService();
subscriptionService.Init()
subscriptionService.subscribeToData('RUxJTlRFUk5FVCBRVUUgU0kgRlVOQ0lPTkEgRklCRVg=');
 // --------------------------
