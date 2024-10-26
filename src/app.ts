import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers, sendMessage, publicarEvento } from './graphql/index.js';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';


interface Config {
    port: number;
    whitelist: string[];
}

class Nucleo {
    constructor() {

    }
    public activeSubscriptions = new Map<string, any>(); // Mapear identificadores de suscripciones a clientes

    async startServer (Puerto: Config)  { 
        let TotalSuscripciones = 0;

        const requests: { [key: number]: any[] } = {};
    
        // Lista blanda de IPs permitidas para el puerto 4001
        const whitelist = Puerto.whitelist 
        const port = Puerto.port;
    
        // Inicializo express
        const app = express();
    
          // Middleware para verificar IP solo en el puerto 4001
           // if (port === 4001) {
            app.use((req, res, next) => {
            const clientIp:any = req.ip; // Obtiene la IP del cliente
            if (whitelist.includes(clientIp)) {
                next(); // Permite la solicitud si la IP está en la lista
            } else {
                res.status(403).send(`Acceso denegado ${clientIp}`); // Deniega el acceso si no está permitido
            }
            });
          // }
    
    
        // Schema
        const schema = makeExecutableSchema({ typeDefs, resolvers });
    
        // Apollo Server
        const apolloServer = new ApolloServer({ schema });
    
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
                        console.log(`Cliente conectado: ${JSON.stringify(ctx)}`);
                        TotalSuscripciones = TotalSuscripciones + 1
                        console.log('Cliente suscrito a', ctx.connectionParams)
                        const id = ctx.connectionParams.clientID;
                        this.activeSubscriptions.set(id, ctx)
                        console.log(`Total de clientes suscritos ${TotalSuscripciones}`)
                    } catch (error) {
                        console.error(error)
                    }
                    
                },
                onDisconnect: (ctx:any, msg, reason) => {
                    // console.log('Cliente desconectado:'); // Aquí puedes manejar la desconexión
                    TotalSuscripciones = TotalSuscripciones - 1    
                                    
                    const id = ctx.connectionParams.clientID
                    this.activeSubscriptions.delete(id);
                    console.log('Cliente desconectado:', id) 
                    console.log(`Total de clientes suscritos ${TotalSuscripciones}`)
                },
                onSubscribe: (context, message) => {
                    // Aqui tengo el control de quien está Conectado
                    // Tender una clase que me control esto
                   // console.log(message);
                   // console.log(context); 
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