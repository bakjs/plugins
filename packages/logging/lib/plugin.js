const GoodPlugin = require('./good/plugin')
const AuditPlugin = require('./audit/plugin')
const Audit = require('./audit/model')

exports.register = function (server, options) {
  let plugins = []

  plugins.push({
    register: GoodPlugin,
    options
  })

  if (options.audit) {
    plugins.push({
      register: AuditPlugin,
      options
    })
  }

  // Non production logging
  if (process.env.NODE_ENV !== 'production') {
    // Print full error traces to console
    server.on('log', (event, tags) => {
      if (tags.error) {
        console.error(event)
      }
    })
  }

  return server.register(plugins)
}

exports.pkg = require('../package.json')

exports.Audit = Audit
