import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers, sendMessage } from './graphql/index.js';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';

const startServer = async () => {

    let TotalSuscripciones = 0;

    // Inicializo express
    const app = express();

    // Schema
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    // Apollo Server
    const apolloServer = new ApolloServer({ schema });

    // Inicia el servidor Apollo
    await apolloServer.start();

    // Aplica el middleware de Apollo Server a la aplicación Express
    apolloServer.applyMiddleware({ app, path: '/graphql' });

    const server = app.listen(4000, () => {
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

        console.log(`🚀 Servidor listo en http://localhost:4000${apolloServer.graphqlPath}`);
        console.log(`🚀 Suscripciones listas en ws://localhost:4000${apolloServer.graphqlPath}`);
    });
};

// // Ejemplo de cómo enviar un mensaje
// setInterval(() => {
//     console.log("Nuevo mensaje enviado");
//     sendMessage('¡Nuevo mensaje enviado!');
// }, 5000); // Envía un mensaje cada 5 segundos

startServer();