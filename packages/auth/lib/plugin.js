const AuthController = require('./controller')
const AuthTokenPlugin = require('./token')
const User = require('./provider/user')

exports.register = (server, authOptions) => {
  // 1- Auth Provider
  // Create Auth provider instance
  const Provider = authOptions.provider || require('./provider/default')
  let authProvider = new Provider(authOptions)

  // 2- Auth Handler
  // Token Based Auth Strategy
  server.auth.scheme('bak', AuthTokenPlugin)

  // Register as default strategy
  server.auth.strategy('auth', 'bak', 'optional', { authOptions, authProvider })

  // 3- API Routes
  // Register Auth Controller
  const authController = new AuthController(authProvider)
  authController.hapi = server
  server.route(authController.routes())

  // 4- HAPI Stuff
  // Expose provider to plugin
  server.expose('auth', authProvider)
}

exports.pkg = require('../package.json')

exports.User = User
