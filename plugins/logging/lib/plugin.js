const { Errors } = require('bak')

exports.register = function (server, options) {
  server.events.on({ name: 'request', channels: 'internal' }, (request, { timestamp, error }, tags) => {
    // const tagsStr = '[' + Object.keys(tags).join('][') + ']'
    Errors.error(error)
  })
}

exports.pkg = require('../package.json')
