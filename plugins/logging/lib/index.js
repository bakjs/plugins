const Errors = require('./errors')

exports.register = function (server, options) {
  const isDev = process.env.NODE_ENV !== 'production'

  server.events.on({ name: 'request', channels: 'internal' }, (request, { timestamp, error }, tags) => {
    if (!error || (!isDev && error.isBoom)) {
      return
    }

    Errors.error(error)
  })
}

exports.once = true

exports.pkg = require('../package.json')

exports.error = Errors.error
