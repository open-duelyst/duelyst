# libraries
path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../..'))

npmRun = require 'npm-run'

Promise = require 'bluebird'
_ = require 'underscore'
moment = require 'moment'
fs = require('fs');

helpers = require 'scripts/helpers'
UtilsLocalization = require 'scripts/localization/utils_localization'

runCommand = (commandStr) ->
  return new Promise( (resolve,reject) ->
    npmRun(commandStr,{},(err,stdOut,stdErr)->
      if err?
        reject(err)
      else
        resolve(stdOut)
    )
  )

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

#   @.allKeysByLanguageKey = {}
#   @.allKeysByLanguageKey["en"] = @.allEnglishKeys = UtilsLocalization.getAllKeysFromLocalizationJsonData(@.englishData)
#   @.allKeysByLanguageKey["de"] = @.allGermanKeys = UtilsLocalization.getAllKeysFromLocalizationJsonData(@.germanData)

#   return Promise.map(["en","de"], (languageKey)=>
#     return UtilsLocalization.generateLastUpdatedDataForKeys(languageKey,@.allKeysByLanguageKey[languageKey])
#   ,{concurrency:1})

# .spread (englishLastUpdatedData,germanLastUpdatedData)->

#   @.englishLastUpdatedData = englishLastUpdatedData
#   @.germanLastUpdatedData = germanLastUpdatedData

#   germanKeysNeedingUpdate = _.filter(@.allGermanKeys,(germanKey)->
#     if (not germanLastUpdatedData[germanKey]?)
#       throw new Error("key: #{germanKey} missing from german translation")
#     if (not englishLastUpdatedData[germanKey]?)
#       throw new Error("key: #{germanKey} missing from english translation")

#     return englishLastUpdatedData[germanKey].committed_at > germanLastUpdatedData[germanKey].committed_at
#   )

#   germanKeysNeedingUpdateStr = _.reduce(germanKeysNeedingUpdate, (memo,keyNeedingUpdate)=>
#     englishTranslation = UtilsLocalization.getTranslationFromFullKey(@.englishData,keyNeedingUpdate)
#     englishTranslation = englishTranslation.replace("\n","\\n")
#     germanTranslation = UtilsLocalization.getTranslationFromFullKey(@.germanData,keyNeedingUpdate)
#     germanTranslation = germanTranslation.replace("\n","\\n")
#     englishUpdatedMoment = moment.utc(@.englishLastUpdatedData[keyNeedingUpdate].committed_at)
#     germanUpdatedMoment = moment.utc(@.germanLastUpdatedData[keyNeedingUpdate].committed_at)
#     englishCommitLink = "https://github.com/88dots/cleancoco/commit/" + @.englishLastUpdatedData[keyNeedingUpdate].commit_hash
#     germanCommitLink = "https://github.com/88dots/cleancoco/commit/" + @.germanLastUpdatedData[keyNeedingUpdate].commit_hash
#     return memo + "#{keyNeedingUpdate}, \"#{englishTranslation}\",\"#{englishCommitLink}\",\"#{englishUpdatedMoment.format("YYYY-MM-DD HH:mm:ss")}\",\"#{germanTranslation}\",\"#{germanCommitLink}\",\"#{germanUpdatedMoment.format("YYYY-MM-DD HH:mm:ss")}\"\n"
#   ,"Key needing update, English Translation, English Commit Link, English Last Updated, German Translation, German Commit Link, German Last Updated\n")

#   return helpers.writeFile("./localization_output/#{"de"}_translations_needing_update.csv",germanKeysNeedingUpdateStr)
.then ()->

  console.log("Complete.")
  process.exit(1)

