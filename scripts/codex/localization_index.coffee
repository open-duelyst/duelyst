#### THIS IS A SPECIAL VERSION FOR CODEX GENERATION, NOT INTENDED FOR USE ELSEWHERE

i18next = require 'i18next'
Promise = require 'bluebird'
translation_en = require "../../app/localization/locales/en/index.json"

options = {
  lng: 'en',
  fallbackLng: 'en',
  contextSeparator: '$',
  defaultNS: 'translation',
  resources: {
    en: {
        translation: translation_en
      }
  }
}

p = new Promise (resolve,reject)->
  i18next
    .init options, (err,t)->
      if (err)
        reject(err)
      else
        resolve(t)


module.exports = p
