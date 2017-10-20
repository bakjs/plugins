const Chalk = require('chalk')
const CallerId = require('caller-id')

function warn (type, message, at) {
  if (at) {
    console.warn('   ' + Chalk.red(at))
  }
  console.warn('⚠️ ', Chalk.yellow(`[${type}]`), Chalk.yellow(message), Chalk.grey('(see https://git.io/vd79N)'))
  console.warn('')
}

function caller () {
  const { filePath, lineNumber, functionName } = CallerId.getData(caller.caller)
  return `${filePath}:${lineNumber}@${functionName}`
}

function isPlugin (obj) {
  return obj && Boolean(obj.pkg || typeof obj.register === 'function')
}

function getFnParamNames (fn) {
  const match = fn.toString().match(/\(.*?\)/)
  return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : []
}

function wrapPlugin (originalPlugin) {
  const plugin = Object.assign({}, originalPlugin)

  // Support for attributes
  if (plugin.register.attributes && !plugin.pkg) {
    plugin.pkg = plugin.register.attributes.pkg || plugin.register.attributes
    delete plugin.register.attributes
  }

  // Wrap register function
  const originalRegister = originalPlugin.register
  const hasNext = getFnParamNames(originalRegister).length > 2
  const name = plugin.name || (plugin.pkg && plugin.pkg.name) || plugin.register.name

  if (hasNext) {
    warn('ASYNC_PLUGINS', 'plugins should return a promise instead of accepting next/callback argument', 'plugin: ' + name)
  }

  plugin.register = function (server, options) {
    return new Promise((resolve, reject) => {
      // Recursively add compat support as each plugin has it's own server realm
      install(server, false)

      const result = originalRegister.call(this, server, options, err => {
        if (err) {
          return reject(err)
        }
        resolve()
      })

      if (!hasNext) {
        return resolve(result)
      }
    })
  }

  return plugin
}

function wrapServerRegister (originalServerRegister) {
  const serverRegister = function (registration, options) {
    if (Array.isArray(registration)) {
      return Promise.all(registration.map(r => serverRegister.call(this, r, options)))
    }

    // Clone to avoid mutating keys of original registration
    registration = Object.assign({}, registration)

    // Support for old { register } syntax
    if (isPlugin(registration.register)) {
      warn('SERVER_REGISTER', 'server registrations are now { plugin, options } instead of { register, options }', caller())
      registration.plugin = registration.register
      delete registration.register
    }

    // Wrap plugin
    if (isPlugin(registration)) {
      registration = wrapPlugin(registration)
    } else {
      registration.plugin = wrapPlugin(registration.plugin)
    }

    // Call to original register
    return originalServerRegister.call(this, registration, options)
  }
  return serverRegister
}

function wrapEventMethod (originalMethod) {
  // method' params are not always the same when calling server.ext
  // We need to use some tests for *guessing* if next/callback is there
  const fnParamNames = getFnParamNames(originalMethod)
  const lastParamName = fnParamNames.length ? fnParamNames[fnParamNames.length - 1] : ''
  const hasNext = lastParamName === 'next' || lastParamName === 'callback' || lastParamName === 'cb'

  if (!hasNext) {
    return originalMethod
  }

  const wrappedFn = function () {
    warn('ASYNC_SERVER_EXT', 'methods for server.ext should return promise instead of accepting next/callback argument', caller())
    return new Promise((resolve, reject) => {
      const next = err => {
        if (err) {
          return reject(err)
        }
        resolve()
      }
      return originalMethod.call(this, ...[].concat(arguments), next)
    })
  }

  return wrappedFn
}

function wrapServerExt (originalServerExt) {
  const serverExt = function (event, method, options) {
    if (Array.isArray(event)) {
      return Promise.all(event.map(e => serverExt.call(this, e)))
    }

    if (method) {
      method = wrapEventMethod(method)
      return originalServerExt.call(this, event, method, options)
    }

    // Clone to prevent mutation
    event = Object.assign({}, event)

    if (Array.isArray(event.method)) {
      event.method = event.method.map(m => wrapEventMethod(m))
    } else if (event.method) {
      event.method = wrapEventMethod(event.method)
    }

    return originalServerExt.call(this, event)
  }
  return serverExt
}

function supportEvents (server) {
  server.decorate('server', 'on', function (event, listener) {
    warn('SERVER_ON', 'server.on is no longer available, use server.events.on instead!', caller())
    if (event === 'tail') {
      return
    }
    server.events.on(event, listener)
  })
}

function install (server, isRoot) {
  if (isRoot) {
    supportEvents(server)
  }

  server.register = wrapServerRegister(server.register)
  server.ext = wrapServerExt(server.ext)
}

exports.register = function bakCompat (server, config) {
  if (!config.server) {
    console.error(Chalk.yellow('[@bakjs/compat] `config.server` is not provided!'))
    return
  }
  install(config.server, true)
}

exports.pkg = require('../package.json')
