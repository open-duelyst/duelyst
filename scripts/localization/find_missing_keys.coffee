# libraries
path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../..'))

npmRun = require 'npm-run'

Promise = require 'bluebird'
_ = require 'underscore'
fs = require('fs');

helpers = require 'scripts/helpers'
UtilsLocalization = require 'scripts/localization/utils_localization'


# git log -G "win_streak_message" --pretty=oneline ./rank.json


Promise.resolve()
.bind {}
.then ()->
  return Promise.all([
    UtilsLocalization.readFileToJsonData(UtilsLocalization.PATH_TO_LOCALES + "/en/index.json")
    # UtilsLocalization.readFileToJsonData(UtilsLocalization.PATH_TO_LOCALES + "/de/index.json")
  ])
# .spread (englishData, germanData)->
#   @.englishData = englishData
#   @.germanData = germanData

#   return UtilsLocalization.writeMissingTranslationFiles("de",@.englishData,@.germanData)

.then ()->

  console.log("Complete.")
  process.exit(1)
