import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers, sendMessage, publicarEvento } from './graphql/index.js';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';

const startServer = async (port: number) => {

    let TotalSuscripciones = 0;

    const requests: { [key: number]: any[] } = {};

// Lista blanda de IPs permitidas para el puerto 4001
const whitelist4001 = ['192.168.1.1']; 

    // Inicializo express
    const app = express();

      // Middleware para verificar IP solo en el puerto 4001
        if (port === 4001) {
            app.use((req, res, next) => {
            const clientIp:any = req.ip; // Obtiene la IP del cliente
            if (whitelist4001.includes(clientIp)) {
                next(); // Permite la solicitud si la IP está en la lista
            } else {
                res.status(403).send('Acceso denegado'); // Deniega el acceso si no está permitido
            }
            });
        }


    // Schema
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    // Apollo Server
    const apolloServer = new ApolloServer({ schema });

    // Inicia el servidor Apollo
    await apolloServer.start();

    // Aplica el middleware de Apollo Server a la aplicación Express
    apolloServer.applyMiddleware({ app, path: '/Thomas' });

    const server = app.listen(port, () => {
        // Crea el WebSocket
        const wsocket = new WebSocketServer({
            server,
            path: apolloServer.graphqlPath,
        });

        useServer({
            schema,
            onConnect: (ctx) => {
                console.log('Cliente conectado:');
                TotalSuscripciones = TotalSuscripciones + 1
                console.log(`Total de clientes suscritos ${TotalSuscripciones}`)
            },
            onDisconnect: (ctx, msg) => {
                console.log('Cliente desconectado:'); // Aquí puedes manejar la desconexión
                TotalSuscripciones = TotalSuscripciones - 1
                console.log(`Total de clientes suscritos ${TotalSuscripciones}`)
            },
        }, wsocket);

        console.log(`🚀 Servidor listo en http://localhost:${port}${apolloServer.graphqlPath}`);
        console.log(`🚀 Suscripciones listas en ws://localhost:${port}${apolloServer.graphqlPath}`);
    });
};

// // Ejemplo de cómo enviar un mensaje
 setInterval(() => {
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
 }, 10000);



// Todos los puertos que estoy escuchando necesito traer esto de un API.
// Luego que tanga la data abro los puertos.
const ports = [4001, 5001, 6001, 7001, 8001];

ports.forEach(port => startServer(port));