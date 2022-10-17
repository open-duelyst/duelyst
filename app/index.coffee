# localization setup
whenLocalizationReady = require 'app/localization/index'

whenLocalizationReady.then ()->
  i18next = require('i18next')
  app = require('./application')