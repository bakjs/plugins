const { Controller } = require('bak')

class $AuthController extends Controller {
  constructor (authProvider) {
    super()
    this.authProvider = authProvider
  }

  init () {
    this.prefix = '/api'
    this.defaults.auth = false

    this.get('/auth/user', this.user, {auth: {mode: 'required'}})

    if (this.authProvider.loginSupported) {
      this.post('/auth/login', this.login)
      this.any('/auth/logout', this.logout, {auth: {mode: 'required'}})
    }

    if (this.authProvider.oauthSupported) {
      this.any('/oauth/{clientID}/login', this.oauthLogin)
      this.any('/oauth/{clientID}/authorize', this.oauthAuthorize)
    }
  }

  async login (request, h) {
    let { username, password } = request.payload || {}
    let { token } = await this.authProvider.login({ username, password, request })
    return { token }
  }

  async logout (request, h) {
    let { session, user } = request
    await this.authProvider.logout({ user, session })
    return 'LOGGED_OUT'
  }

  async user (request, h) {
    return { user: request.user }
  }

  async oauthLogin (request, h) {
    let redirect_uri = await this.authProvider.oauthLogin(request.params.clientID)
    return { redirect_uri }
  }

  async oauthAuthorize (request, h) {
    let { token, user } = await this.authProvider.oauthAuthorize(request.params.clientID, request)
    return { token, user }
  }
}

module.exports = $AuthController
