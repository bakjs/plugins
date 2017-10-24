const Mongoose = require('mongoose')
const Model = require('./model')

// Use native promises
Mongoose.Promise = global.Promise

// Register mongoose-fill
// @see https://github.com/whitecolor/mongoose-fill
require('mongoose-fill')

exports.register = function (server, config = {}) {
  // Use custom function to log collection methods + arguments
  Mongoose.set('debug', config.debug)

  // Register cachegoose
  // @see https://github.com/boblauer/cachegoose
  if (config.cache !== false) {
    // Require only when needed
    const cachegoose = require('cachegoose')
    cachegoose(Mongoose, config.cache)
  }

  let queue = Object.keys(config.connections).map(connection_name => {
    const connection = config.connections[connection_name]

    const clientOptions = {
      useMongoClient: true,
      promiseLibrary: global.Promise
    }

    if (connection_name === 'default') {
      return Mongoose.connect(connection.uri, clientOptions)
    }
    return Mongoose.createConnection(connection.uri, clientOptions)
  })

  return Promise.all(queue)
}

exports.pkg = require('../package.json')

exports.once = true

exports.Model = Model
exports.Schema = Mongoose.Schema
