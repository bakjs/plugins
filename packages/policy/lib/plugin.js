const GuardPlugin = require('./guard-plugin')
const AuthorizePlugin = require('./authorize-plugin')

exports.register = function (server, options) {
  if (!options) options = {}

  server.register({ register: GuardPlugin, options })

  server.register({ register: AuthorizePlugin, options })
}

exports.pkg = require('../package.json')

exports.GuardPlugin = GuardPlugin
exports.AuthorizePlugin = AuthorizePlugin
