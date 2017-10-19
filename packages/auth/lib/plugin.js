const AuthController = require('./controller')
const TokenScheme = require('./token-scheme')
const User = require('./provider/user')

exports.register = (server, authOptions) => {
  // Create Auth provider instance
  const Provider = authOptions.provider || require('./provider/default')
  let authProvider = new Provider(authOptions)

  // Expose provider
  server.expose('auth', authProvider)

  // Register token scheme
  server.auth.scheme('token', TokenScheme)

  // Register token strategy as default
  server.auth.strategy('default', 'token', { authOptions, authProvider })

  // Set default as the default strategy
  server.auth.default('default')

  // Register Auth Controller
  const authController = new AuthController(authProvider)
  authController.hapi = server
  server.route(authController.routes())
}

exports.pkg = require('../package.json')

exports.User = User
