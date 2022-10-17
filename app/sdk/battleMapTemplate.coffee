SDKObject = require './object'
CONFIG = require 'app/common/config'
UtilsJavascript =     require 'app/common/utils/utils_javascript'
_ = require 'underscore'

###
  Helper class that stores properties used to create the battle map environment a game is played in (map, weather, etc).
###
class BattleMapTemplate extends SDKObject

  mapTemplate: {
    map: 0
    weatherChance: 0.0
    rainChance: 0.0
    snowChance: 0.0
    blueDustChance: 0.0
    blueDustColor: null
    sunRaysChance: 0.0
    clouds: []
  }
  hasWeather: false
  hasRain: false
  hasSnow: false
  hasBlueDust: false
  hasSunRays: false

  # region INITIALIZATION

  constructor: (gameSession,templateIndex) ->
    super(gameSession)

    # define public properties here that must be always be serialized
    # do not define properties here that should only serialize if different from the default
    # if no templateIndex provided, choose a map at random
    templateIndex ?= _.sample(CONFIG.BATTLEMAP_DEFAULT_INDICES)
    # get a random battlemap template from the list of available maps
    @mapTemplate = CONFIG.BATTLEMAP_TEMPLATES[templateIndex]

    # each map may have custom weather
    @updateWeather()

  # endregion INITIALIZATION

  # region GETTERS

  getMapTemplate: () ->
    return @mapTemplate

  getMap: () ->
    return if @mapTemplate? then @mapTemplate.map else BattleMapTemplate.prototype.mapTemplate.map

  getClouds: () ->
    return if @mapTemplate? then @mapTemplate.clouds else BattleMapTemplate.prototype.mapTemplate.clouds

  getBlueDustColor: () ->
    return if @mapTemplate? then @mapTemplate.blueDustColor else BattleMapTemplate.prototype.mapTemplate.blueDustColor

  getHasWeather: () ->
    return @hasWeather

  getHasRain: () ->
    return @hasRain

  getHasSnow: () ->
    return @hasSnow

  getHasBlueDust: () ->
    return @hasBlueDust

  getHasSunRays: () ->
    return @hasSunRays

  # endregion GETTERS

  # region WEATHER

  updateWeather: () ->
    # reset map
    @hasSnow = false
    @hasRain = false
    @hasBlueDust = false
    @hasSunRays = false
    @hasWeather = false

    # setup map
    mapTemplate = @getMapTemplate()
    weatherChance = if mapTemplate.weatherChance? then mapTemplate.weatherChance else BattleMapTemplate.prototype.mapTemplate.weatherChance
    rainChance = if mapTemplate.rainChance then mapTemplate.rainChance else BattleMapTemplate.prototype.mapTemplate.rainChance
    snowChance = if mapTemplate.snowChance then mapTemplate.snowChance else BattleMapTemplate.prototype.mapTemplate.snowChance
    blueDustChance = if mapTemplate.blueDustChance then mapTemplate.blueDustChance else BattleMapTemplate.prototype.mapTemplate.blueDustChance
    sunRaysChance = if mapTemplate.sunRaysChance then mapTemplate.sunRaysChance else BattleMapTemplate.prototype.mapTemplate.sunRaysChance

    # check the weather
    @hasWeather = Math.random() <= weatherChance
    if @hasWeather
      totalChances = (snowChance * snowChance + rainChance * rainChance)
      if totalChances != 0.0
        # all individual weather chances will be normalized to add up to 100%
        # ex: if we can have rain, snow, and storm, but rain and storm have 0% chance, snow will be 100%
        totalChances = 1.0 / totalChances
        snowChance *= totalChances
        rainChance *= totalChances

        weatherTypeChance = Math.random()
        if weatherTypeChance <= snowChance
          @hasSnow = true
        else if weatherTypeChance <= snowChance + rainChance
          @hasRain = true
    else
      @hasBlueDust = Math.random() <= blueDustChance
      @hasSunRays = Math.random() <= sunRaysChance

  # endregion WEATHER

  # region SERIALIZATION

  deserialize: (data) ->
    UtilsJavascript.fastExtend(this,data)

  # endregion SERIALIZATION

module.exports = BattleMapTemplate
