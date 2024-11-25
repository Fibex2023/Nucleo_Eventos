import express, { Request, Response, NextFunction } from 'express';
import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import { typeDefs, resolvers, sendMessage, publicarEvento, activeSubscriptions, _JSONBuffer } from './graphql/index.js';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { Config, GetEnv } from './services/GetEnv.js';
import { clsApiHttp } from './services/ApiHttp.js';

 

class Nucleo {
  private _JSONBuffer: any = _JSONBuffer;  
  public _activeSubscriptions = activeSubscriptions; // Mapear identificadores de suscripciones a clientes
  
  constructor() {
    // Ejemplo de uso
  }

  

  async startServer(Puerto: Config) {
    let TotalSuscripciones = 0;

    // Lista blanda de IPs permitidas para el puerto
    const whitelist = Puerto.whitelist;
    const ipWhitelistMiddleware = (req: Request, res: Response, next: NextFunction) => {
      const clientIp: any = req.ip;
      if (whitelist.includes(clientIp)) {
        next();
      } else {
        res.status(403).send('Forbidden');
      }
    };

    const port = Puerto.port;

    // Inicializo express
    const app = express();

    app.use(compression()); // Usar gzip
    // app.use(ipWhitelistMiddleware);    // Bloqueo por IP

    // Schema
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const apolloServer: any = new ApolloServer({
      schema,
      context: ({ req }) => {
        return {};
      },
    });

    // Inicia el servidor Apollo
    await apolloServer.start();

    // Aplica el middleware de Apollo Server a la aplicación Express
    apolloServer.applyMiddleware({ app, path: '/' });

    const server = app.listen(port, () => {
      // Crea el WebSocket
      const wsocket = new WebSocketServer({
        server,
        path: apolloServer.graphqlPath,
      });

      useServer(
        {
          schema,
          onConnect: (ctx: any) => {
            try {
              TotalSuscripciones = TotalSuscripciones + 1;              
              console.log(`Total de clientes suscritos ${TotalSuscripciones}`);
            } catch (error) {
              console.error(error);
            }
          },
          onDisconnect: (ctx: any, msg, reason) => {
            TotalSuscripciones = TotalSuscripciones - 1;
            console.log(`Cliente Desconectado: ${ctx.IdAbonado}`);
            // Lo elimino del Maps de Control
            this._activeSubscriptions.delete(ctx.IdAbonado);
            // console.log(Array.from(this._activeSubscriptions.values()));
            console.log(`Total de clientes suscritos ${TotalSuscripciones}`);
          },
          onSubscribe: async (context: any, message: any) => {
            // La idea es tener un identificador unico de conexion
            // Esto mejora el Maps que tengo
            

            // Guardo la hora en la que se conecto            
            context.IdAbonado = message.payload.variables.id
            
            const DataControlConect = {
                ...message.payload.variables,   // me da el id de la conexion                
                TimerConet: Date.now(),
                TimerUltMensaje: Date.now()
              };
            // Agrego al Maps el abonado conectado
            this._activeSubscriptions.set(context.IdAbonado, DataControlConect);

            const validateArray = (element: any): boolean => {
              return Array.isArray(element);
            };

            // Busco el cliente se que se caba de conectar a ver si tengo algo que entregarle
            const Data: any = await _JSONBuffer.findDataById(DataControlConect);

            if (Data) {
              let currentIndex = 0;
              const sendArrayElement = async () => {
                if (currentIndex < Data.length) {
                  if (validateArray(Data)) {
                    const element = Data[currentIndex];

                    // Aqui debo eleminar solo el elemento que acabo de enviar y no todo.... 
                    // si tengo varios elementos lo estoy eliminando
                    await _JSONBuffer.deleteData(_element => _element.id == element.id);
                    publicarEvento(element.id, element.message);
                    currentIndex++;
                  }
                } else {
                  publicarEvento(Data.id, Data.message);
                  clearInterval(intervalId);
                }
              };
 
              let intervalId: any;
              if (!validateArray(Data)) {
                // Si tengo 1 solo elemento por entregar entonces espero 1Seg y se lo entrego
                intervalId = setInterval(sendArrayElement, 1000);
              } else {
                // Si tengo varios elementos por entregar espero 3Seg entre la entrega
                // Tomando en cuenta que la app debe procesas lo que envio por eso espero....
                intervalId = setInterval(sendArrayElement, 3000);
              }
            }
            console.log('Suscripción iniciada:', DataControlConect);
          },
        }, 
        wsocket
      );

      console.log(`🚀 Servidor listo en http://localhost:${port}${apolloServer.graphqlPath}`);
      console.log(`🚀 Suscripciones listas en ws://localhost:${port}${apolloServer.graphqlPath}`);
    });
  }
}

const _GetEnv: GetEnv = new GetEnv()
const PortInit: Config[] = _GetEnv.Init();

let _Nucleo: Nucleo = new Nucleo();
PortInit.forEach(Port => _Nucleo.startServer(Port));
