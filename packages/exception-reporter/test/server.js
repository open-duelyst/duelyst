// Require this file to throw random errors for testing
const exceptionReporter = require('@counterplay/exceptionreporter')
var counter = 0

function crash () {
  throw new Error('crash')
}

function fail () {
  return new Promise((resolve, reject) => {
    console.log('rejected promise')
    reject('rejected promise')
  })
}

function timer () {
  setInterval(() => {
    var e = new Error(`this is a error ${counter}`)
    console.log(e.message)
    counter++
    throw e
  }, 1000)
}

function random () {
  fail()
}

module.exports = {
  fail: fail,
  timer: timer,
  random: random,
  crash: crash
}
