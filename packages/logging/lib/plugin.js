const GoodPlugin = require('./good')
const AuditPlugin = require('./audit')

const LoggingPlugin = {

  register (server, options) {
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
}

LoggingPlugin.register.attributes = {
  name: 'bak-logging'
}

module.exports = LoggingPlugin
