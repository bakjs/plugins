const { error } = require('./errors')

exports.register = function (server, options) {
  server.events.on({ name: 'request', channels: 'internal' }, (request, { timestamp, error }, tags) => {
    // const tagsStr = '[' + Object.keys(tags).join('][') + ']'
    error(error)
  })
}

exports.pkg = require('../package.json')

exports.error = error
