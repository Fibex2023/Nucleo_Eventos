import express, { Request, Response, NextFunction } from 'express'
import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import { typeDefs, resolvers, sendMessage, publicarEvento, activeSubscriptions, _JSONBuffer } from './graphql/index.js';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
 
interface Config {
    port: number;
    whitelist: string[];
}

class Nucleo {
    public _JSONBuffer: any = _JSONBuffer;
    constructor() {
        // Ejemplo de uso 
    }
    public _activeSubscriptions = activeSubscriptions; // Mapear identificadores de suscripciones a clientes

    async startServer (Puerto: Config)  { 
        let TotalSuscripciones = 0;

        const requests: { [key: number]: any[] } = {};
    
        // Lista blanda de IPs permitidas para el puerto 4001
        const whitelist = Puerto.whitelist 

        const ipWhitelistMiddleware = (req: Request, res: Response, next: NextFunction) => {
            const clientIp: any = req.ip;
            if (whitelist.includes(clientIp)) {
              next();
            } else {
              res.status(403).send('Forbidden');
            }
        }
            
        const port = Puerto.port;
    
        // Inicializo express
        const app = express();
    
          // Middleware para verificar IP solo en el puerto 4001
           // if (port === 4001) {
          /*  app.use((req, res, next) => {
                const clientIp:any = req.ip; // Obtiene la IP del cliente
                if (whitelist.includes(clientIp)) {
                    next(); // Permite la solicitud si la IP está en la lista
                } else {
                    res.status(403).send(`Acceso denegado ${clientIp}`); // Deniega el acceso si no está permitido
                }
            });*/
          // }

          app.use(compression()); // Usar gzip
          app.use(ipWhitelistMiddleware);

        
          
    
    
        // Schema
        const schema = makeExecutableSchema({ typeDefs, resolvers });
    
        // Apollo Server
        // const apolloServer = new ApolloServer({ schema });
        const apolloServer:any = new ApolloServer({
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
    
            useServer({
                schema,
                onConnect: (ctx: any) => {
                    try {
                       // console.log(`Cliente conectado: ${JSON.stringify(ctx)}`);
                        TotalSuscripciones = TotalSuscripciones + 1
                       
                        console.log(`Total de clientes suscritos ${TotalSuscripciones}`)
                    } catch (error) {
                        console.error(error)
                    }
                    
                },
                onDisconnect: (ctx:any, msg, reason) => {
                    // console.log('Cliente desconectado:'); // Aquí puedes manejar la desconexión
                    TotalSuscripciones = TotalSuscripciones - 1    

                    // const id = ctx.connectionParams.clientID
                     this._activeSubscriptions.delete(ctx);
                //    Array.from(this._activeSubscriptions.keys())
                    // console.log('Cliente desconectado:', id) 
                    console.log(Array.from(this._activeSubscriptions.values()))
                    console.log(`Total de clientes suscritos ${TotalSuscripciones}`)
                },
                onSubscribe: async (context, message) => {
                    
                    
                   // console.log(message);                    // console.log(context);                    
                   // const id = context.connectionParams.clientID;
                   // control de quien está Conectado
                   this._activeSubscriptions.set(context, message.payload.variables)
                   const validateArray = (element: any): boolean => {
                        return Array.isArray(element);
                   }                  
                   // Busco si tendo algo en el Buffer para ese usuario
                   const Data:any = await _JSONBuffer.findDataById(message.payload.variables) 
                   
                   if (Data) {
                        // console.log(Data);
                        let currentIndex = 0;

                        const sendArrayElement = async () => {  
                                if (currentIndex < Data.length) {
                                    if (validateArray(Data)) {                                        
                                        const element = Data[currentIndex];
                                        await _JSONBuffer.deleteData(_element => _element.id == element.id) 
                                        publicarEvento(element.id, element.message);
                                        // Deberia borrar el elemento del buffer                                
                                        currentIndex++;
                                    } else {
                                        // No est
                                        console.log("PASE126-2")       
                                    }                                   
                                } else { 
                                        
                                        publicarEvento(Data.id, Data.message);                            
                                        clearInterval(intervalId); // Detener el intervalo cuando se hayan enviado todos los elementos                                         
                                    }
                        };
                        let intervalId: any;
                        if (!validateArray(Data)) { 
                            // Deberia borrar el elemento del buffer                                
                            // Espero para entregarle la date que tengo.                           
                            intervalId = setInterval(sendArrayElement, 1000)
                        } else  {                            
                            intervalId = setInterval(sendArrayElement, 3000)
                        }
                        
                        
                   }
                   // Me permite mostrar todos los conectados
                   // console.log(JSON.stringify(_JSONBuffer.getAllData()))                   
                   console.log('Suscripción iniciada con payload:', message.payload.variables);
                }
            }, wsocket);
    
            console.log(`🚀 Servidor listo en http://localhost:${port}${apolloServer.graphqlPath}`);
            console.log(`🚀 Suscripciones listas en ws://localhost:${port}${apolloServer.graphqlPath}`);
        });
    }

} 

// // Ejemplo de cómo enviar un mensaje
/* setInterval(() => {
     let evento = {
         id:20000,
         tipo_mensaje: 1,
         mensaje:'Esta recibiendo un mensaje'
     }
     console.log("Nuevo mensaje enviado 1");
     publicarEvento('26728159',evento);
 }, 15000); // Envía un mensaje cada 5 segundos

setInterval(() => {
     let evento = {
         id:1000000,
         tipo_mensaje: 2,
         mensaje:'Esta recibiendo un mensaje'
     }
     console.log("Nuevo mensaje enviado 2");
     publicarEvento('12345678',evento);
 }, 10000); */



// Todos los puertos que estoy escuchando necesito traer esto de un API.
// Luego que tanga la data abro los puertos.
const PortInit = [{ port: 4001, whitelist: ['192.168.0.124', '::1'] },
                  { port: 5001, whitelist: ['192.168.1.1', '127.0.0.1', '::1'] },
                  { port: 6001, whitelist: ['192.168.1.1', '127.0.0.1', '::1'] },
                  { port: 7001, whitelist: ['192.168.1.1', '127.0.0.1', '::1'] },
                  { port: 8001, whitelist: ['192.168.1.1', '127.0.0.1'] },
                ]

let _Nucleo: Nucleo = new Nucleo()
PortInit.forEach(Port => _Nucleo.startServer(Port))