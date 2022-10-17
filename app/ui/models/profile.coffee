Logger = require('app/common/logger')
EventBus = require('app/common/eventbus')
EVENTS = require('app/common/event_types')
Scene = require('app/view/Scene')
DuelystFirebase = require('app/ui/extensions/duelyst_firebase')
CONFIG = require('app/common/config')
audio_engine = require('app/audio/audio_engine')
NotificationsManager = require('app/ui/managers/notifications_manager')
Analytics = require('app/common/analytics')
Storage = require('app/common/storage')
moment = require('moment')
CosmeticsLookup = require ('app/sdk/cosmetics/cosmeticsLookup')

Profile = DuelystFirebase.Model.extend

  initialize: ->
    Logger.module("UI").log "initialize a Profile model"
    # listen for changes to settings
    @on("sync", @onSync, @)
    @on("change:gameSpeed", @onGameSpeedChange, @)
    @on("change:lightingQuality", @onLightingQualityChange, @)
    @on("change:shadowQuality", @onShadowQualityChange, @)
    @on("change:boardQuality", @onBoardQualityChange, @)
    @on("change:bloom", @onBloomChange, @)
    @on("change:doNotDisturb", @onDoNotDisturbChange, @)
    @on("change:showLoreNotifications", @onShowLoreNotificationsChange, @)
    @on("change:alwaysShowStats", @onAlwaysShowStatsChange, @)
    @on("change:showBattleLog", @onShowBattleLogChange, @)
    @on("change:stickyTargeting", @onStickyTargetingChange, @)
    @on("change:showInGameTips", @onShowInGameTipsChange, @)
    @on("change:razerChromaEnabled", @onRazerChromaEnabled, @)
    @on("change:masterVolume", @onMasterVolumeChange, @)
    @on("change:musicVolume", @onMusicVolumeChange, @)
    @on("change:voiceVolume", @onVoiceVolumeChange, @)
    @on("change:effectsVolume", @onEffectsVolumeChange, @)

    @.onSyncOrReady().then ()=>
      # certain event handlers should only happen after first sync
      @.on("change:ltv", @onLtvChanged, @)

    # trigger initial changes
    @onGameSpeedChange()
    @onLightingQualityChange()
    @onShadowQualityChange()
    @onBoardQualityChange()
    @onBloomChange()
    @onDoNotDisturbChange()
    @onShowLoreNotificationsChange()
    @onAlwaysShowStatsChange()
    @onShowBattleLogChange()
    @onStickyTargetingChange()
    @onShowInGameTipsChange()
    @onMasterVolumeChange()
    @onMusicVolumeChange()
    @onEffectsVolumeChange()

  defaults:
    id: 0
    username: "Duelyst"
    gameSpeed: 0.0
    lightingQuality: CONFIG.LIGHTING_QUALITY_HIGH
    shadowQuality: CONFIG.SHADOW_QUALITY_HIGH
    boardQuality: CONFIG.BOARD_QUALITY_HIGH
    bloom: CONFIG.BLOOM_DEFAULT
    doNotDisturb: false
    showLoreNotifications: true
    alwaysShowStats: true
    selectedScene: null
    showBattleLog: true
    showPlayerDetails: false
    stickyTargeting: false
    showInGameTips: true
    razerChromaEnabled: false
    showPrismaticsInCollection: true
    showPrismaticsWhileCrafting: false
    showSkinsInCollection: true
    filterCollectionCardSet: 0
    masterVolume: CONFIG.DEFAULT_MASTER_VOLUME
    musicVolume: CONFIG.DEFAULT_MUSIC_VOLUME
    voiceVolume: CONFIG.DEFAULT_VOICE_VOLUME
    effectsVolume: CONFIG.DEFAULT_SFX_VOLUME

  getFullName: () ->
    @get('username')

  onSync: () ->
    # ensure volume isn't super loud
    masterVolume = parseFloat(@get("masterVolume"))
    if masterVolume > 1.0 then @set("masterVolume", masterVolume / 100.0)
    musicVolume = parseFloat(@get("musicVolume"))
    if musicVolume > 1.0 then @set("musicVolume", musicVolume / 100.0)
    voiceVolume = parseFloat(@get("voiceVolume"))
    if voiceVolume > 1.0 then @set("voiceVolume", voiceVolume / 100.0)
    effectsVolume = parseFloat(@get("effectsVolume"))
    if effectsVolume > 1.0 then @set("effectsVolume", effectsVolume / 100.0)

  onGameSpeedChange: () ->
    @setGameSpeed(@get('gameSpeed'))

  onLightingQualityChange: () ->
    @setLightingQuality(@get('lightingQuality'))

  onShadowQualityChange: () ->
    @setShadowQuality(@get('shadowQuality'))

  onBoardQualityChange: () ->
    @setBoardQuality(@get('boardQuality'))

  onBloomChange: () ->
    @setBloom(@get('bloom'))

  onAlwaysShowStatsChange: () ->
    @setAlwaysShowStats(@get('alwaysShowStats'))

  onShowBattleLogChange: () ->
    @setShowBattleLog(@get('showBattleLog'))

  onStickyTargetingChange: () ->
    @setStickyTargeting(@get('stickyTargeting'))

  onShowInGameTipsChange: () ->
    @setShowInGameTips(@get('showInGameTips'))

  onRazerChromaEnabled: () ->
    @setRazerChromaEnabled(@get('razerChromaEnabled'))

  onMasterVolumeChange: () ->
    @setMasterVolume(@get('masterVolume'))

  onMusicVolumeChange: () ->
    @setMusicVolume(@get('musicVolume'))

  onVoiceVolumeChange: () ->
    @setVoiceVolume(@get('voiceVolume'))

  onEffectsVolumeChange: () ->
    @setEffectsVolume(@get('effectsVolume'))

  onDoNotDisturbChange: () ->
    @setDoNotDisturb(@get('doNotDisturb'))

  onShowLoreNotificationsChange: () ->
    @setShowLoreNotifications(@get('showLoreNotifications'))

  setGameSpeed: (val) ->
    CONFIG.gameSpeed = parseFloat(val)

  setLightingQuality: (val) ->
    CONFIG.lightingQuality = parseFloat(val)

  setShadowQuality: (val) ->
    CONFIG.shadowQuality = parseFloat(val)

  setBoardQuality: (val) ->
    CONFIG.boardQuality = parseFloat(val)

    # update board quality
    scene = Scene.getInstance()
    gameLayer = scene && scene.getGameLayer()
    if gameLayer?
      gameLayer.getTileLayer().updateBoardQuality()

  setBloom: (val) ->
    CONFIG.bloom = parseFloat(val)

  setAlwaysShowStats: (val) ->
    CONFIG.alwaysShowStats = val

    # update stats
    scene = Scene.getInstance()
    gameLayer = scene && scene.getGameLayer()
    if gameLayer?
      gameLayer.updateShowingSdkNodeStats()

  setShowBattleLog: (val) ->
    CONFIG.showBattleLog = val

    # update battle log
    scene = Scene.getInstance()
    gameLayer = scene && scene.getGameLayer()
    battleLog = gameLayer && gameLayer.getBattleLog()
    if battleLog?
      battleLog.setVisible(CONFIG.showBattleLog)

  setStickyTargeting: (val) ->
    CONFIG.stickyTargeting = val

  setShowInGameTips: (val) ->
    CONFIG.showInGameTips = val

  setRazerChromaEnabled: (val) ->
    CONFIG.razerChromaEnabled = window.isDesktop && val

  setMasterVolume: (val) ->
    audio_engine.current().set_master_volume(val)

    # TODO: remove this when audio_engine takes over on playing sfx
    @onEffectsVolumeChange()

  setMusicVolume: (val) ->
    audio_engine.current().set_music_volume(val)

  setVoiceVolume: (val) ->
    audio_engine.current().set_voice_volume(val)

  setEffectsVolume: (val) ->
    audio_engine.current().set_sfx_volume(val)

  setDoNotDisturb: (val) ->
    if val
      NotificationsManager.getInstance().dismissNotificationsThatCantBeShown()

  setSelectedScene: (scene) ->
    if scene? and CONFIG.selectedScene != scene
      if scene != CosmeticsLookup.Scene.Frostfire
        @.set("selectedScene", scene)
        Storage.set("selectedScene", scene)
      lastSelectedScene = CONFIG.selectedScene
      CONFIG.selectedScene = scene
      EventBus.getInstance().trigger(EVENTS.change_scene, {type: EVENTS.change_scene, from: lastSelectedScene, to: scene})

  setShowLoreNotifications: (val) ->
    # nothing yet

  getRegistrationDate: () ->
    return @get('created_at')

  onLtvChanged: (val)->
    currentLtv = val.get("ltv")
    Analytics.identify(null,{ltv:currentLtv})

    # Detect first monetization event
    previousLtv = val.previous("ltv") || 0
    if previousLtv == 0 && currentLtv != 0
      # TODO: There are probably better ways to track this now?
      Analytics.track("first purchase made", {
        category: Analytics.EventCategory.FTUE,
        price: currentLtv,
      },{
        sendUTMData:true
        valueKey: "price"
        nonInteraction: 1
      })

module.exports = Profile
