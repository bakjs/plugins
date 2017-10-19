const Boom = require('boom')
const Hoek = require('hoek')
const Joi = require('joi')

// Based on https://github.com/johnbrett/hapi-auth-bearer-token (MIT)

const tokenScheme = function (server, { authOptions, authProvider }) {
  Hoek.assert(authOptions, 'Missing authOptions')
  Hoek.assert(authProvider, 'Missing authProvider')

  const options = Hoek.applyToDefaults(defaults, authOptions)

  Joi.assert(options, optionsSchema)

  const authenticate = async (request, h) => {
    // Use headers by default
    let authorization = request.raw.req.headers.authorization

    // Fallback 1 : Check for cookies
    if (options.allowCookieToken &&
        !authorization &&
        request.state[options.accessTokenName]) {
      authorization = options.tokenType + ' ' + request.state[options.accessTokenName]
    }

    // Fallback 2 : URL Query
    if (options.allowQueryToken &&
        !authorization &&
        request.query[options.accessTokenName]) {
      authorization = options.tokenType + ' ' + request.query[options.accessTokenName]
      delete request.query[options.accessTokenName]
    }

    // Fallback 3 : Throw Error
    if (!authorization) {
      throw Boom.unauthorized(null, options.tokenType)
    }

    // Try to parse headers
    const parts = authorization.split(/\s+/)

    // Ensure correct token type
    if (parts[0].toLowerCase() !== options.tokenType.toLowerCase()) {
      return Boom.unauthorized(null, options.tokenType)
    }

    // Try to login
    const token = parts[1]
    const { credentials, artifacts } = await authProvider.authToken(token)

    // OK
    return h.authenticated({ credentials, artifacts })
  }

  // https://github.com/hapijs/hapi/blob/master/API.md#authentication-scheme
  return {
    authenticate
  }
}

module.exports = tokenScheme

const defaults = {
  accessTokenName: 'token',
  allowQueryToken: true,
  allowCookieToken: true,
  tokenType: 'Bearer'
}

const optionsSchema = Joi.object().keys({
  accessTokenName: Joi.string().required(),
  allowQueryToken: Joi.boolean(),
  allowCookieToken: Joi.boolean(),
  tokenType: Joi.string().required()
}).unknown(true)
