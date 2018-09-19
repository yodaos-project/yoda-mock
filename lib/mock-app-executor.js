'use strict'

var _ = require('@yoda/util')._

var helper = require('./helper')
var lightApp = require(`${helper.paths.runtime}/app/light-app`)

/**
 *
 * @param {object} profile -
 * @param {string} appHome -
 * @param {string} appId -
 * @param {AppRuntime} runtime -
 */
function Executor (profile, appHome, appId, runtime) {
  this.profile = profile
  this.appId = appId
  this.runtime = runtime
  this.daemon = _.get(profile, 'metadata.daemon', false)
  this.app = null

  this.type = 'light'
  this.appHome = appHome
}

Executor.prototype.create = function () {
  if (this.daemon && this.app != null) {
    return Promise.resolve(this.app)
  }

  return lightApp(this.appId, this.appHome, this.runtime)
    .then(app => {
      this.app = app
      app.emit('ready')
      return app
    })
}

/**
 *
 * @param {ActivityDescriptor} app
 * @returns {Promise<void>}
 */
Executor.prototype.destruct = function destruct () {
  if (this.app == null) {
    return Promise.resolve()
  }
  return Promise.resolve()
    .then(() => {
      this.app.destruct()
      this.app = null
    })
}

module.exports = Executor
