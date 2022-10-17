Promise = require 'bluebird'
i18next = require 'i18next'
XHR = require 'i18next-xhr-backend'
LngDetector = require 'i18next-browser-languagedetector'
Storage = require 'app/common/storage'

options = {
  whitelist: ['en', 'de'],
  fallbackLng: 'en',
  contextSeparator: '$',
  defaultNS: 'translation',
  backend: {
    loadPath: "resources/locales/{{lng}}/index.json"
  },
  detection: {
    order: ['querystring', 'navigator'],
    lookupQuerystring: 'lng',
    lookupLocalStorage: Storage.namespace() + '.i18nextLng',
  }
}

p = new Promise (resolve, reject) ->

  preferredLanguageKey = Storage.get('preferredLanguageKey')

  if (preferredLanguageKey != null)
    options.lng = preferredLanguageKey

  i18next
    .use(LngDetector)
    .use(XHR)
    .init options, (err,t)->
      if (err)
        reject(err)
      else
        resolve(t)


module.exports = p
