_ = require 'underscore'
RSX = require('app/data/resources')
PlayModes = require './playModesLookup'
moment = require 'moment'
i18next = require 'i18next'

class PlayModeFactory

  @playModes: null

  @playModeForIdentifier: (identifier) ->
    @_initCache()
    playMode = @playModes[identifier]
    if playMode
      return playMode
    else
      # no play mode found
      console.error "PlayModeFactory.playModeForIdentifier - Unknown play mode identifier: #{identifier}".red

  @getAllVisiblePlayModes: () ->
    playModes = []

    playModeIdentifiers = Object.keys(PlayModeFactory.playModes)
    for playModeIdentifier in playModeIdentifiers
      playMode = @playModeForIdentifier(playModeIdentifier)
      if !playMode.isHiddenInUI then playModes.push(playMode)

    return playModes

  @getAllEnabledPlayModes: () ->
    playModes = []

    playModeIdentifiers = Object.keys(PlayModeFactory.playModes)
    for playModeIdentifier in playModeIdentifiers
      playMode = @playModeForIdentifier(playModeIdentifier)
      if playMode.enabled and !playMode.isHiddenInUI then playModes.push(playMode)

    return playModes

  @_initCache: ()->
    if not @playModes
      # setup play mode data
      @.playModes ?= {}
      pm = @.playModes

      pm[PlayModes.Practice] = {
        id: PlayModes.Practice,
        name: i18next.t("main_menu.play_mode_practice_name"),
        description: i18next.t("main_menu.play_mode_practice_description"),
        img: RSX.play_mode_sandbox.img,
        enabled: true
        isHiddenInUI: false
      }

      pm[PlayModes.Ranked] = {
        id: PlayModes.Ranked,
        name: i18next.t("main_menu.play_mode_ranked_name"),
        description: i18next.t("main_menu.play_mode_ranked_description"),
        img: RSX.play_mode_rankedladder.img,
        enabled: true
        isHiddenInUI: false
      }

      pm[PlayModes.Challenges] = {
        id: PlayModes.Challenges,
        name: i18next.t("main_menu.play_mode_solo_challenges_name"),
        description: i18next.t("main_menu.play_mode_solo_challenges_description"),
        img: RSX.challenge_gate_010.img,
        enabled: true
        isHiddenInUI: false
      }

      pm[PlayModes.Casual] = {
        id: PlayModes.Casual,
        name: "Unranked Play",
        description: "Find an online opponent and play for fun!",
        img: RSX.play_mode_unranked.img,
        enabled: false
        isHiddenInUI: true
      }

      pm[PlayModes.Gauntlet] = {
        id: PlayModes.Gauntlet,
        name: i18next.t("main_menu.play_mode_gauntlet_name"),
        description: i18next.t("main_menu.play_mode_gauntlet_description"),
        img: RSX.play_mode_arenagauntlet.img,
        enabled: true
        isHiddenInUI: false
        # availableOnDaysOfWeek: [0,3,5,6] # 0-6 indexed Sun-Sat
      }

      pm[PlayModes.Rift] = {
        id: PlayModes.Rift,
        name: i18next.t("main_menu.play_mode_rift_name"),
        description: i18next.t("main_menu.play_mode_rift_description"),
        img: RSX.play_mode_rift.img,
        enabled: false
        isHiddenInUI: true
        # availableOnDaysOfWeek: [0,3,5,6] # 0-6 indexed Sun-Sat
        # gamesRequiredToUnlock: 20
        # softDisableOnDate: "2017-03-15" # UTC Time
      }

      pm[PlayModes.BossBattle] = {
        id: PlayModes.BossBattle,
        name: "Boss Battle",
        description: "",
        img: RSX.play_mode_bossbattle.img,
        enabled: true
        isHiddenInUI: true
      }

      pm[PlayModes.Friend] = {
        id: PlayModes.Friend,
        name: "Friendly Match",
        description: "Play against a friend.",
        img: RSX.play_mode_sandbox.img,
        enabled: true
        isHiddenInUI: true
      }

      pm[PlayModes.Sandbox] = {
        id: PlayModes.Sandbox,
        name: "Sandbox",
        description: "Play against yourself as both Player 1 and Player 2.",
        img: RSX.play_mode_sandbox.img,
        enabled: true
        isHiddenInUI: true
      }

      pm[PlayModes.Developer] = {
        id: PlayModes.Developer,
        name: "Developer Sandbox",
        description: "Shuffle free. Mulligan free.",
        img: RSX.play_mode_sandbox.img,
        enabled: true
        isHiddenInUI: true
      }

module.exports = PlayModeFactory
