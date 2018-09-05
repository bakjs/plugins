const { parseRequest, commonFormat, formatJOSN, formatError } = require('./utils')

exports.register = function (server, options) {
  const isDev = process.env.NODE_ENV !== 'production'

  server.events.on(
    { name: 'request', channels: ['error', 'internal'] }, (request, { error, timestamp }, tags) => {
      // Parse request
      const reqInfo = parseRequest(request, timestamp)

      if (isDev) {
        // Show full traces in dev mode
        console.error('\n' + formatJOSN(reqInfo))
        console.error('\n' + formatError(error) + '\n')
      } else {
        // Log with common log format
        console.log(commonFormat(reqInfo))
      }
    }
  )
}

exports.pkg = require('../package.json')
exports.once = true
exports.configKey = 'logging'
