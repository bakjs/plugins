const GoodAudit = require('./good-audit')
const Audit = require('./model')

exports.register = function (server, config) {
  // Audit Helper
  server.decorate('request', 'audit', function audit (args, additional_tags = []) {
    // Normalize target
    if (args.target && args.target._id) {
      // Target model
      if (!args.target_model) {
        args.target_model = args.target.constructor.modelName
      }

      // We only need to store target._id
      args.target = args.target._id
    }

    // Normalize user
    let user
    if (this.auth.credentials && this.auth.credentials.user) {
      user = this.auth.credentials.user._id
    }

    // Emit log event
    this.log(['audit'].concat(additional_tags), Object.assign({ user, ip: this.ip }, args))
  })
}

exports.name = '@bakjs/audit'
exports.pkg = require('../package.json')

exports.GoodAudit = GoodAudit
exports.Audit = Audit
