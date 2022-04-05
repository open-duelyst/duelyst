'use strict'
var bugsnag = require('bugsnag-js').noConflict()
var path = require('path')
var url = require('url')

var isDevelopment
var isElectron

function init (options) {
  bugsnag.apiKey = options.apiKey
  bugsnag.releaseStage = options.releaseStage
  bugsnag.appVersion = options.appVersion
  bugsnag.context = '/'
  bugsnag.projectRoot = '/'
  bugsnag.beforeNotify = beforeNotify
  bugsnag.user = {}
  bugsnag.metaData = {}
  isDevelopment = options.isDevelopment || false
  isElectron = options.isElectron || false
  if (isElectron) {
    bugsnag.metaData.electron = {
      windowArgs: electronWindowArgs(),
      versions: electronVersionData()
    }
  }
}

function electronWindowArgs () {
  if (window.__args__ && window.__args__.data) {
    var args = window.__args__.data
    delete args['_']
    return args
  }
  return {}
}

function electronVersionData () {
  return {}
  // TODO : this is broken inside a browserify context because browserify shims process object with own version
  // return {
  //   electron: process.versions['electron'],
  //   chrome: process.versions['chrome'],
  //   node: process.versions['node']
  // }
}

function stripStack (str) {
  if (!str || str.length === 0 || typeof str !== 'string') {
    return str
  }
  return str
    .replace(/at .*\\src\\/g, 'at /')
    .replace(/at .*\/src\//g, 'at /')
}

function stripFileUrl (str) {
  if (!str || str.length === 0 || typeof str !== 'string') {
    return str
  }
  var parts = path.normalize(str).split(path.sep)
  return parts[parts.length - 1].replace(/(.*?(?:js|html))|.*/g, '')
}

function stripAjaxUrl (str) {
  if (!str || str.length === 0 || typeof str !== 'string') {
    return str
  }
  return str.replace(/\/-.{19}\//g, '/')
}

function beforeNotify (payload, metaData) {
  if (isDevelopment) {
    console.error("[EXCEPTION REPORTED][" + payload.name + "] " + payload.message)
    console.log("[EXCEPTION METADATA][" + JSON.stringify(metaData) + "]")
    return false
  }
  if (payload.metaData.script) {
    if (payload.metaData.script.src && !payload.metaData.script.src.match(/duelyst.com|file:/g)) {
      return false
    }
    payload.metaData.script = undefined
  }
  if (isElectron) {
    if (payload.file != null) {
      payload.file = stripFileUrl(payload.file)
    }
    if (payload.url != null) {
      payload.url = stripFileUrl(payload.url)
    }
    if (payload.stacktrace != null) {
      payload.stacktrace = stripStack(payload.stacktrace)
    }
  }
}

function ajaxHandler (event, jqxhr, settings, thrownError) {
  var status = jqxhr.status
  var type = settings.type
  var requestData = settings.data
  var requestUrl = url.parse(settings.url)
  var responseData = jqxhr.responseText

  if (status === 401) {
    return
  }
  if (!requestUrl.hostname.indexOf('duelyst.com')) {
    return
  }
  if (jqxhr.statusText === 'timeout') {
    status = 'Timeout'
  }
  if (requestData) {
    requestData = JSON.parse(requestData)
    delete requestData['token']
    delete requestData['email']
    delete requestData['password']
    delete requestData['deck']
  }
  if (responseData) {
    try {
      responseData = JSON.parse(responseData)
    } catch (e) {
      responseData = 'Malformed JSON response.'
    }
  }

  var errorName = "AjaxError " + status + " " + type + " " + stripAjaxUrl(requestUrl.pathname)
  var metaData = {
    ajax: {
      url: settings.url,
      type: type,
      status: status || null,
      statusText: jqxhr.statusText || null,
      requestData: requestData || null,
      responseText: responseData || null
    }
  }
  notify(new Error(thrownError), errorName, metaData)
}

function notify () {
  // bugsnag.notifyException.apply(null, arguments)
}

function leaveBreadcrumb () {
  bugsnag.leaveBreadcrumb.apply(null, arguments)
}

function catchHandler (err) {
  notify(err)
  throw err
}

function setUserData (userData) {
  bugsnag.user = userData
}

function setMetaData (metaData) {
  bugsnag.metaData = Object.assign({}, bugsnag.metaData, metaData)
}

module.exports = {
  init: init,
  notify: notify,
  leaveBreadcrumb: leaveBreadcrumb,
  catchHandler: catchHandler,
  ajaxHandler: ajaxHandler,
  setUserData: setUserData,
  setMetaData: setMetaData
}
