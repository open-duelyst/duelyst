// Require this file to throw random errors for testing
const exceptionReporter = require('@counterplay/exceptionreporter')
let counter = 0

setInterval(() => {
  let e = new Error(`this is a error ${counter}`)
  counter++
  console.log(e.message)
  exceptionReporter.notify(e)
  exceptionReporter.notify(new Error('new error'))
  exceptionReporter.notify(new Error('super new error'), 'SUPER NEW NAME')
  exceptionReporter.notify('Just a string error!')
  anotherexception.foo.wtf()
  fail()
  fail().catch(exceptionReporter.catch)
}, 5000)

function fail () {
  return new Promise((resolve, reject) => {
    reject('promise fail!')
  })
}
