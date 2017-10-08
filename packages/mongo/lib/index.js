const Mongoose = require('mongoose')
const Model = require('./model')
const plugin = require('./plugin')

// Use native promises
Mongoose.Promise = global.Promise

// Register mongoose-fill
// @see https://github.com/whitecolor/mongoose-fill
require('mongoose-fill')

module.exports = {
  Model,
  register: plugin.register,
  Schema: Mongoose.Schema,
  Mongoose
}
