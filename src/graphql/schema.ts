import { gql } from 'apollo-server-express';
import * as fs from 'fs'

//src\\graphql\\ .\\dist\\graphql

export const typeDefs = gql(
  fs.readFileSync('dist/graphql/query/type.graphql', 'utf8')+
  fs.readFileSync('dist/graphql/mutation/mutation.graphql', 'utf8')
);

// +
// fs.readFileSync(__dirname.concat('_subCollection.graphql'), 'utf8') +
// fs.readFileSync(__dirname.concat('_dashboard.graphql'), 'utf8') +
// fs.readFileSync(__dirname.concat('_Mutation.graphql'), 'utf8')