'use strict'
const bugsnag = require('bugsnag')

let isDevelopment
let quitOnError

function init (options) {
  bugsnag.register(options.apiKey, {
    releaseStage: options.releaseStage,
    appVersion: options.appVersion,
    notifyReleaseStages: ['staging', 'production'],
    filters: ['password', 'authorization', 'creditcard'],
    autoNotify: false,
    metaData: {}
  })
  quitOnError = options.quitOnError || false
  isDevelopment = options.isDevelopment || false
  bugsnag.onBeforeNotify(onBeforeNotify)
}

function onBeforeNotify (payload) {
  if (isDevelopment) {
    const notification = payload.events[0]
    console.error(`[EXCEPTION REPORTED] [${notification.exceptions[0].errorClass}] ${notification.exceptions[0].message}`)
    return false
  }
}

function notify () {
  // bugsnag.notify.apply(null, arguments)
}

function catchHandler (err) {
  notify(err)
  throw err
}

function setMetaData (metaData) {
  bugsnag.metaData = Object.assign({}, bugsnag.metaData, metaData)
}

function onUnhandledRejection (err) {
  notify(err, {errorName: 'unhandledRejection'}, () => {
    console.error(`[UNHANDLED REJECTION] ${err.message}`)
    console.error(err.stack)
    if (quitOnError) {
      process.exit(1)
    }
  })
}

function onUncaughtException (err) {
  notify(err, {errorName: 'uncaughtException'}, () => {
    console.error(`[UNCAUGHT EXCEPTION] ${err.message}`)
    console.error(err.stack)
    if (quitOnError) {
      process.exit(1)
    }
  })
}

process.on('uncaughtException', onUncaughtException)
process.on('unhandledRejection', onUnhandledRejection)

module.exports = {
  init: init,
  notify: notify,
  catchHandler: catchHandler,
  setMetaData: setMetaData
}
