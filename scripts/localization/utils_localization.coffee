# Localization Script Helpers

###
  UtilsLocalization - game session utility methods.
###

UtilsLocalization = {}
module.exports = UtilsLocalization

path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../..'))

npmRun = require 'npm-run'
ProgressBar = require 'progress'

Promise = require 'bluebird'
_ = require 'underscore'

helpers = require 'scripts/helpers'
fs = require('fs');

UtilsLocalization.PATH_TO_LOCALES = "../../app/localization/locales"



UtilsLocalization.createBlankJsonForKeys = (keys,defaultTo) ->
  jsonData = {}
  _.each(keys, (key)->
    splitKeyVals = key.split(".")
    jsonData[splitKeyVals[0]] = jsonData[splitKeyVals[0]] or {}
    if defaultTo?[splitKeyVals[0]]?[splitKeyVals[1]]?
      jsonData[splitKeyVals[0]][splitKeyVals[1]] = defaultTo[splitKeyVals[0]][splitKeyVals[1]]
    else
      jsonData[splitKeyVals[0]][splitKeyVals[1]] = ""
  )

  return jsonData

UtilsLocalization.getAllKeysFromLocalizationJsonData = (jsonData)  ->
  return _.reduce(jsonData, (memo,val,key) ->
    return memo.concat(_.reduce(val,(innerMemo,innerVal,innerKey) ->
      innerMemo.push("#{key}.#{innerKey}")
      return innerMemo
    ,[]))
  ,[])

UtilsLocalization.readFileToJsonData = (fileName) ->
  return new Promise( (resolve, reject) ->
    fs.readFile(fileName, (err,contents) ->
      if (err)
          reject(err)
      resolve(contents)
    )
  ).then (fileContents)->
    return Promise.resolve(JSON.parse(fileContents))

UtilsLocalization.writeMissingTranslationFiles = (languageKey, englishData, translationData) ->
  englishKeys = UtilsLocalization.getAllKeysFromLocalizationJsonData(englishData)
  translationKeys = UtilsLocalization.getAllKeysFromLocalizationJsonData(translationData)

  missingKeysFromTranslation = _.difference(englishKeys,translationKeys)

  emptyJsonForMissingTranslationKeys = UtilsLocalization.createBlankJsonForKeys(missingKeysFromTranslation)
  missingTranslationKeysStr = JSON.stringify(emptyJsonForMissingTranslationKeys,null,2)

  defaultedJsonForMissingTranslationKeys = UtilsLocalization.createBlankJsonForKeys(missingKeysFromTranslation,englishData)
  missingGermanKeysDefaultedStr = JSON.stringify(defaultedJsonForMissingTranslationKeys,null,2)

  return Promise.all([
    helpers.writeFile("./localization_output/missing_#{languageKey}_translations_empty.json",missingTranslationKeysStr)
    helpers.writeFile("./localization_output/missing_#{languageKey}_translations_with_english.json",missingGermanKeysDefaultedStr)
  ])

UtilsLocalization.generateLastUpdatedDataForKeys = (languageKey,translationKeys)->
#  return Promise.map(translationKeys.slice(0,15),(key)->
  bar = new ProgressBar("processing #{languageKey} [:bar] :current/:total :percent :etas :elapsed", {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: translationKeys.length
  })
  return Promise.map(translationKeys,(key)->
    return UtilsLocalization.getLastUpdatedCommitForTranslation(languageKey,key)
    .then (lastUpdatedCommitMsg)->
      splitMsg = lastUpdatedCommitMsg.split(",")
      lastUpdateData = {
        committed_at: parseInt(splitMsg[0])*1000
        commit_hash: splitMsg[1]
      }
      bar.tick()
      return Promise.resolve([key,lastUpdateData])
  ,{concurrency:10})
  .then (keyValuePairsOfLastUpdates)->
  #  console.log("here #{JSON.stringify(keyValuePairsOfLastUpdates,null,2)}")
    lastUpdatedData = _.reduce(keyValuePairsOfLastUpdates,(memo,pair)->
      memo[pair[0]] = pair[1]
      return memo
    ,{})
#    console.log("here #{JSON.stringify(lastUpdatedData,null,2)}")
    return Promise.resolve(lastUpdatedData)

UtilsLocalization.getLastUpdatedCommitForTranslation = (languageKey,translationKey)->
  #  git log -G "win_streak_message" --pretty=oneline --max-count=1 ./rank.json
  return runCommand(buildLastCommitCommandStrForTranslation(languageKey,translationKey))
  .then (result)->
#    console.log("here last time #{translationKey} was update is: " + result)
    return Promise.resolve(result)

UtilsLocalization.getTranslationFromFullKey = (translationData,fullTranslationKey)->
  return translationData[fullTranslationKey.split(".")[0]][fullTranslationKey.split(".")[1]]


# Sub helpers
runCommand = (commandStr) ->
  return new Promise( (resolve,reject) ->
    npmRun(commandStr,{},(err,stdOut,stdErr)->
      if err?
        reject(err)
      else
        resolve(stdOut)
    )
  )

buildLastCommitCommandStrForTranslation = (languageKey,translationKey) ->
  splitTranslationKey = translationKey.split(".")
  categoryName = splitTranslationKey[0]
  subTranslationKey = splitTranslationKey[1]
  # TODO: need to perform a regex that will only look within a category
  # See https://git-scm.com/docs/git-log#_pretty_formats for different formats
  if languageKey == "en"
#    return "git log -G \"#{subTranslationKey}\" --pretty=oneline --max-count=1 #{UtilsLocalization.PATH_TO_LOCALES}/#{languageKey}/#{categoryName}.json"
    return "git log -G \"#{subTranslationKey}\" --pretty=format:%at,%H --max-count=1 #{UtilsLocalization.PATH_TO_LOCALES}/#{languageKey}/#{categoryName}.json"
  else
#    return "git log -G \"#{subTranslationKey}\" --pretty=oneline --max-count=1 #{UtilsLocalization.PATH_TO_LOCALES}/#{languageKey}/index.json"
    return "git log -G \"#{subTranslationKey}\" --pretty=format:%at,%H --max-count=1 #{UtilsLocalization.PATH_TO_LOCALES}/#{languageKey}/index.json"

# end sub helpers
