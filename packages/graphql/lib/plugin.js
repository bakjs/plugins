const fs = require('fs')
const path = require('path')
const { graphqlHapi, graphiqlHapi } = require('graphql-server-hapi')
const { makeExecutableSchema } = require('graphql-tools')
const chalk = require('chalk')
const _ = require('lodash')
const { Utils } = require('bak')

const TAG = '[GraphQL]'

exports.register = (server, options, next) => {
  // Read all schemas and resolvers
  const typeDefs = []
  const resolvers = []

  // Load schema files
  const schemasDir = options.schemasDir || path.resolve(process.cwd(), 'graphql')

  fs.readdirSync(schemasDir).forEach(schemaFile => {
    const schema = require(path.resolve(schemasDir, schemaFile))

    if (schema.types) {
      typeDefs.push(schema.types)
    }

    if (schema.resolvers) {
      resolvers.push(schema.resolvers)
    }
  })

  // Compile Schema
  let schema = null

  try {
    schema = makeExecutableSchema({
      typeDefs,
      resolvers: _.merge.apply(null, resolvers)
    })
  } catch (err) {
    return next(chalk.yellow(`${TAG} ${err}`))
  }

  // Register Graphql Server
  const graphqlPath = options.path || '/api/graphql'

  server.register({
    register: graphqlHapi,
    options: {
      path: graphqlPath,
      graphqlOptions: request => {
        return {
          schema,
          context: {
            user: request.auth.credentials ? request.auth.credentials.user : null,
            session: request.auth.artifacts,
            ip: Utils.realIP(request)
          }
        }
      }
    }
  })

  // Register Graphiql on non production environments
  const graphiqlPath = options.graphiqlPath || '/graphiql'

  if (options.graphiql === true || (options.graphiql !== false && process.env.NODE_ENV !== 'production')) {
    server.register({
      register: graphiqlHapi,
      options: {
        path: graphiqlPath,
        graphiqlOptions: {
          endpointURL: graphiqlPath
        }
      }
    })
  }

  next()
}

exports.pkg = require('../package.json')
