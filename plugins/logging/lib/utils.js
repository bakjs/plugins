const Chalk = require('chalk')
const { startCase } = require('lodash')

function parseRequest (request, timestamp) {
  let date = new Date(timestamp)
  let host = realIP(request)
  let ident = null
  let reqLine = request.method.toUpperCase() + ' ' + request.path
  let status = request.response ? request.response.statusCode : null
  let bytes = 0

  let authuser = null
  if (request.auth.credentials && request.auth.credentials.user) {
    const user = request.auth.credentials.user
    authuser = user.username || user.email || user.id || user._id
  }

  const reqInfo = { host, ident, authuser, date, request: reqLine, status, bytes }

  return reqInfo
}

function realIP (request) {
  return request.ip || request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || request.info['remoteAddress']
}

function commonFormat (reqInfo) {
  return [
    reqInfo.host,
    reqInfo.ident,
    reqInfo.authuser,
    '[' + reqInfo.date.toUTCString() + ']',
    '"' + reqInfo.request + '"',
    reqInfo.status,
    reqInfo.bytes
  ].map(p => p || '-').join(' ')
}

function formatJOSN (obj) {
  return Object.keys(obj)
    .filter(k => obj[k])
    .map(k => Chalk.grey(startCase(k) + ': ') + obj[k])
    .join('\n')
}

function formatError (error) {
  const cwd = process.cwd()

  const lines = error.stack.split('\n').splice(1).map(line => {
    // Strip cwd()
    line = line.replace(cwd + '/', '')

    // Internals
    if (line.includes('<anonymous>') || line.includes('internal/')) {
      return Chalk.grey(line)
    }

    // Node Modules
    if (line.includes('node_modules/')) {
      return Chalk.grey(line)
    }

    return line
  })

  return Chalk.red(error) + '\n' + lines.join('\n')
}

module.exports = {
  realIP,
  formatJOSN,
  commonFormat,
  parseRequest,
  formatError
}
