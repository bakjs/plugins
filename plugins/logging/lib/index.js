const Chalk = require('chalk')
const Errors = require('./errors')

exports.register = function (server, options) {
  const isDev = process.env.NODE_ENV !== 'production'

  server.events.on(
    { name: 'request', channels: 'internal' },
    (request, { timestamp, error }, tags) => {
      if (!error) {
        return
      }

      if (error.isBoom) {
        let { name, message, statusCode } = error

        if (error.output) {
          message = message || error.output.payload.message
          statusCode = error.output.payload.statusCode
        }

        console.error(
          '\n' + Chalk.red(`[${name}] [${statusCode}]`),
          Chalk.red(request.path),
          Chalk.grey(`\n${message}`)
        )
        return
      }

      Errors.error(error)
    }
  )
}

exports.once = true

exports.pkg = require('../package.json')

exports.error = Errors.error
