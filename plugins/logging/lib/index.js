const Errors = require('./errors')

exports.register = function (server, options) {
  server.events.on({ name: 'request', channels: 'internal' }, (request, { timestamp, error }, tags) => {
    if (!error || error.isBoom) {
      return
    }

    Errors.error(error)
  })
}

exports.once = true

exports.pkg = require('../package.json')

exports.error = Errors.error
