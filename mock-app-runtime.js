var inherits = require('util').inherits

var AppRuntime = require('/usr/lib/yoda/runtime/lib/app-runtime')

/**
 * @module @yoda/mock
 */

module.exports = MockAppRuntime

/**
 * @class
 * @extends AppRuntime
 */
function MockAppRuntime () {
  AppRuntime.call(this)
  this.nextTickTrigger = setInterval(() => {}, 10)

  this.ttsId = 1

  this.ttsService = {
    speak: function speak (text) {
      var ttsId = this.ttsId
      this.ttsId += 1
      setTimeout(() => {
        this.dbusSignalRegistry.emit(`callback:tts:${ttsId}`, 'end')
      }, 2000)
      return Promise.resolve([ ttsId ])
    }
  }
  this.lightService = {
    setPickup: function setPickup (duration) {
      return Promise.resolve([])
    }
  }
  this.multimediaService = {

  }

  this.mockContexts = []
}
inherits(MockAppRuntime, AppRuntime)

/**
 *
 * @param {string[]} paths - app root paths (not **apps root** path)
 */
MockAppRuntime.prototype.init = function init (paths) {
  if (!Array.isArray(paths)) {
    throw new TypeError('Expect an array on first argument of MockAppRuntime#init.')
  }
  return this.loader.loadPaths(paths)
    .then(() => {
      this.loadAppComplete = true
    })
}

/**
 * Mock tts/light/multimedia services methods.
 *
 * @param {'tts' | 'light' | 'multimedia'} name -
 * @param {string} method -
 * @param {Function} fn -
 *
 * @example
 * test('should speak text', t => {
 *   t.plan(1)
 *   runtime.restore()
 *   runtime.mockService('tts', 'speak', function (text) {
 *     t.strictEqual(text, '泥猴啊')
 *     return Promise.resolve([ this.ttsId++ ])
 *   })
 *   runtime.mockAsr('泥猴啊')
 * })
 */
MockAppRuntime.prototype.mockService = function mockService (name, method, fn) {
  var service = this[`${name}Service`]
  this.mockContexts.push({
    name: name,
    method: method,
    original: service[method]
  })
  service[method] = fn
}

/**
 * Restores previously mocked service methods.
 */
MockAppRuntime.prototype.restore = function restore () {
  var contexts = this.mockContexts
  this.mockContexts = []
  contexts.forEach(it => {
    var service = this[`${it.name}Service`]
    service[it.method] = it.original
  })
}

MockAppRuntime.prototype.ttsMethod = function (name, args) {
  var handler = this.ttsService[name]
  if (handler == null) {
    return Promise.reject(new Error('TtsD Method not mocked'))
  }
  return handler.apply(this, args)
}

MockAppRuntime.prototype.lightMethod = function lightMethod (name, args) {
  var handler = this.lightService[name]
  if (handler == null) {
    return Promise.reject(new Error('LightD Method not mocked'))
  }
  return handler.apply(this, args)
}

MockAppRuntime.prototype.multimediaMethod = function multimediaMethod (name, args) {
  var handler = this.multimediaService[name]
  if (handler == null) {
    return Promise.reject(new Error('MultimediaD Method not mocked'))
  }
  return handler.apply(this, args)
}

MockAppRuntime.prototype.destruct = function destruct () {
  clearInterval(this.nextTickTrigger)
}
