var test = require('tape')
var Mock = require('../')

test('should mock app runtime', t => {
  var rt
  try {
    Mock.mockAppRuntime('/opt/apps/guidance')
      .then(runtime => {
        rt = runtime
        t.notLooseEqual(runtime, null, 'mocked runtime shall not be nil')
        t.notLooseEqual(runtime.mockService, null, 'mocked runtime.mockService shall not be nil')
        t.notLooseEqual(runtime.restore, null, 'mocked runtime.restore shall not be nil')

        t.strictEqual(Object.keys(runtime.loader.executors).length, 1, 'mocked app runtime shall load expected app only')

        runtime.destruct()
        t.end()
      })
      .catch(err => {
        t.error(err)

        rt && rt.destruct()
        t.end()
      })
  } catch (err) {
    t.error(err)

    rt && rt.destruct()
    t.end()
  }
})
