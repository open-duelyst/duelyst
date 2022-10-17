
RSX = require('app/data/resources')
CONFIG = require('app/common/config')
UtilsGameSession = require('app/common/utils/utils_game_session')
Factions = require './factionsLookup'
Cards = require './cardsLookupComplete'
FactionProgression = require 'app/sdk/progression/factionProgression'
_ = require 'underscore'
i18next = require 'i18next'

class FactionFactory

  @factionMap: {}

  @factionForPlayer1: (gameSession) ->
    return @factionForPlayer(gameSession, gameSession.getPlayer1())

  @factionForPlayer2: (gameSession) ->
    return @factionForPlayer(gameSession, gameSession.getPlayer2())

  @factionForMyPlayer: (gameSession) ->
    return @factionForPlayer(gameSession, gameSession.getMyPlayer())

  @factionForOpponentPlayer: (gameSession) ->
    return @factionForPlayer(gameSession, gameSession.getOpponentPlayer())

  @factionForPlayer: (gameSession, player) ->
    return @factionForPlayerId(gameSession, player.getPlayerId())

  @factionForPlayerId: (gameSession, playerId) ->
    playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameSession, playerId)
    playerFactionId = playerSetupData.factionId
    return @factionForIdentifier(playerFactionId)

  @factionForIdentifier: (identifier) ->
    faction = @factionMap[identifier]
    if faction
      return faction
    else
      # no faction found
      console.error "FactionFactory.factionForIdentifier - Unknown faction identifier: #{identifier}".red

  @_allFactions: null
  @getAllFactions: () ->
    if !@_allFactions?
      @_allFactions = []
      for factionId in _.chain(Factions).values().uniq().value()
        faction = FactionFactory.factionForIdentifier(factionId)
        if faction
          @_allFactions.push(faction)

    return @_allFactions

  @_playableFactions: null
  @getAllPlayableFactions: () ->
    if !@_playableFactions?
      @_playableFactions = []
      for factionId in _.chain(Factions).values().uniq().value()
        faction = FactionFactory.factionForIdentifier(factionId)
        if faction and faction.enabled and not faction.isNeutral and not faction.isInDevelopment
          @_playableFactions.push(faction)

    return @_playableFactions

  @_enabledFactions: null
  @getAllEnabledFactions: () ->
    if !@_enabledFactions?
      @_enabledFactions = []
      for factionId in _.chain(Factions).values().uniq().value()
        faction = FactionFactory.factionForIdentifier(factionId)
        if faction and faction.enabled
          @_enabledFactions.push(faction)

    return @_enabledFactions

  @starterDeckForFactionLevel: (factionId,factionLevel=0)->
    starterDeck = @.factionForIdentifier(factionId).starterDeck.slice()
    if factionLevel > 0
      unlockedCardIds = FactionProgression.unlockedCardsUpToLevel(factionLevel, factionId)
      for cardId in unlockedCardIds
        if FactionFactory.unlockedCardIsValidForStarterDeck(cardId)
          for i in [0...CONFIG.MAX_DECK_DUPLICATES]
            starterDeck.push({id: cardId})

    return starterDeck

  @cardIdIsGeneral: (cardId) ->
    return @factionForGeneralId(cardId)?

  @unlockedCardIsValidForStarterDeck: (cardId) ->
    # if card is not prismatic, it is valid for starter decks
    if Cards.getIsPrismaticCardId(cardId) then return false

    # search for faction for this card id
    # if card id is a general, it will return a faction
    # if card is not a general, it is valid for starter deck
    # if card id is primary general, it is valid for starter deck
    factionData = @factionForGeneralId(cardId)
    return !factionData? or cardId == factionData.generalIdsByOrder[FactionFactory.GeneralOrder.Primary]

  @generalIdForFactionByOrder: (factionId, order) ->
    return @factionForIdentifier(factionId)?.generalIdsByOrder[order]

  @generalOrderForFactionById: (factionId, generalId) ->
    generalId = Cards.getBaseCardId(parseInt(generalId))
    return @factionForIdentifier(factionId)?.generalOrderByIds[generalId]

  @factionForGeneralId: (generalId) ->
    generalId = Cards.getBaseCardId(parseInt(generalId))
    factionIds = Object.keys(@factionMap)
    for factionId in factionIds
      faction = @factionMap[factionId]
      if faction.generalIds? and _.contains(faction.generalIds, generalId)
        return faction

  @generalIdsForFaction: (factionId) ->
    return @factionForIdentifier(factionId)?.generalIds or []

  @factionIdForGeneralId: (generalId) ->
    return @factionForGeneralId(generalId)?.id

  @getCrestResourceForFactionId: (factionId) ->
    faction = @factionForIdentifier(factionId)
    return faction?.crestResource

  @getCrestShadowResourceForFactionId: (factionId) ->
    faction = @factionForIdentifier(factionId)
    return faction?.crestShadowResource

  @getCrestDeckSelectResourceForFactionId: (factionId) ->
    faction = @factionForIdentifier(factionId)
    return faction?.crestDeckSelectResource

  @getTauntCallout: (myGeneralId, opponentGeneralId) ->
    callout = "Are you ready for this?"
    myGeneralId = Cards.getBaseCardId(parseInt(myGeneralId))
    myFaction = @factionForGeneralId(myGeneralId)
    if myFaction?
      opponentGeneralId = Cards.getBaseCardId(parseInt(opponentGeneralId))
      # check if there is a callout map defined for my general
      calloutDataForMyGeneral = myFaction.generalTauntCallouts[myGeneralId]
      if _.isObject(calloutDataForMyGeneral)
        # check if there is a callout defined for the opponent general
        calloutDataForOpponentGeneral = calloutDataForMyGeneral[opponentGeneralId]
        if _.isString(calloutDataForOpponentGeneral)
          callout = calloutDataForOpponentGeneral
        else
          opponentFaction = @factionForGeneralId(opponentGeneralId)
          if opponentFaction?
            # check if there is a callout defined for the opponent faction
            calloutDataForOpponentFaction = calloutDataForMyGeneral[opponentFaction.id] || calloutDataForMyGeneral[Factions.Neutral]
            if _.isString(calloutDataForOpponentFaction)
              callout = calloutDataForOpponentFaction
      else
        opponentFaction = @factionForGeneralId(opponentGeneralId)
        if opponentFaction?
          # check if there is a callout defined for the opponent faction
          calloutDataForOpponentFaction = myFaction.generalTauntCallouts[opponentFaction.id] || myFaction.generalTauntCallouts[Factions.Neutral]
          if _.isString(calloutDataForOpponentFaction)
            callout = calloutDataForOpponentFaction
          else if _.isObject(calloutDataForOpponentFaction)
            calloutDataForOpponentGeneral = calloutDataForOpponentFaction[opponentGeneralId]
            if _.isString(calloutDataForOpponentGeneral)
              callout = calloutDataForOpponentGeneral

    return callout

  @getTauntResponse: (myGeneralId, opponentGeneralId) ->
    response = "Enough! To battle!"
    myGeneralId = Cards.getBaseCardId(parseInt(myGeneralId))
    myFaction = @factionForGeneralId(myGeneralId)
    if myFaction?
      opponentGeneralId = Cards.getBaseCardId(parseInt(opponentGeneralId))
      # check if there is a response map defined for my general
      responseDataForMyGeneral = myFaction.generalTauntResponses[myGeneralId]
      if _.isObject(responseDataForMyGeneral)
        # check if there is a response defined for the opponent general
        responseDataForOpponentGeneral = responseDataForMyGeneral[opponentGeneralId]
        if _.isString(responseDataForOpponentGeneral)
          response = responseDataForOpponentGeneral
        else
          opponentFaction = @factionForGeneralId(opponentGeneralId)
          if opponentFaction?
            # check if there is a response defined for the opponent faction
            responseDataForOpponentFaction = responseDataForMyGeneral[opponentFaction.id] || responseDataForMyGeneral[Factions.Neutral]
            if _.isString(responseDataForOpponentFaction)
              response = responseDataForOpponentFaction
      else
        # check if there is a response defined for the opponent general
        responseDataForOpponentGeneral = myFaction.generalTauntResponses[opponentGeneralId]
        if _.isString(responseDataForOpponentGeneral)
          response = responseDataForOpponentGeneral
        else
          opponentFaction = @factionForGeneralId(opponentGeneralId)
          if opponentFaction?
            # check if there is a response defined for the opponent faction
            responseDataForOpponentFaction = myFaction.generalTauntResponses[opponentFaction.id] || myFaction.generalTauntResponses[Factions.Neutral]
            if _.isString(responseDataForOpponentFaction)
              response = responseDataForOpponentFaction

    return response

# setup map for general order
FactionFactory.GeneralOrder = {
  Primary: 1
  Secondary: 2
  Tertiary: 3
}

# generate factions once in a map
fmap = FactionFactory.factionMap

# f1
fmap[Factions.Faction1] =
  id: Factions.Faction1
  fxResource: ["FX.Factions.Neutral", "FX.Factions.Faction1"]
  name: i18next.t("factions.faction_1_name")
  short_name: i18next.t("factions.faction_1_abbreviated_name")
  description: i18next.t("factions.faction_1_description")
  devName: "lyonar"
  isNeutral: false
  enabled: true
  isInDevelopment: false
  generalTauntCallouts: {}
  generalTauntResponses: {}
  generalIds: [Cards.Faction1.General, Cards.Faction1.AltGeneral, Cards.Faction1.ThirdGeneral]
  generalIdsByOrder: {}
  generalOrderByIds: {}
  resignStatement: i18next.t("factions.faction_1_resign_statement")
  crestResource: RSX.crest_f1
  crestShadowResource: RSX.crest_f1_shadow
  crestDeckSelectResource: RSX.crest_f1_deck_select
  gradientColorMapWhite: {r: 250, g: 200, b: 80, a: 255}
  gradientColorMapBlack: {r: 40, g: 33, b: 4, a: 255}

  starterDeck: [
    {id: Cards.Faction1.General},
    {id: Cards.Artifact.SunstoneBracers},
    {id: Cards.Artifact.SunstoneBracers},
    {id: Cards.Artifact.SunstoneBracers},
    {id: Cards.Spell.TrueStrike},
    {id: Cards.Spell.TrueStrike},
    {id: Cards.Spell.TrueStrike},
    {id: Cards.Spell.WarSurge},
    {id: Cards.Spell.WarSurge},
    {id: Cards.Spell.WarSurge},
    {id: Cards.Faction1.WindbladeAdept},
    {id: Cards.Faction1.WindbladeAdept},
    {id: Cards.Faction1.WindbladeAdept},
    {id: Cards.Neutral.BloodshardGolem},
    {id: Cards.Neutral.PutridMindflayer},
    {id: Cards.Neutral.SaberspineTiger},
    {id: Cards.Neutral.PrimusShieldmaster},
    {id: Cards.Neutral.PrimusShieldmaster},
    {id: Cards.Faction1.LysianBrawler},
    {id: Cards.Faction1.LysianBrawler},
    {id: Cards.Faction1.LysianBrawler},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.StormmetalGolem},
    {id: Cards.Neutral.Bloodletter},
    {id: Cards.Neutral.DragoneboneGolem},
    {id: Cards.Neutral.DragoneboneGolem}
  ]

# f1 general data
f1GO = fmap[Factions.Faction1].generalIdsByOrder
f1GO[FactionFactory.GeneralOrder.Primary] = Cards.Faction1.General
f1GO[FactionFactory.GeneralOrder.Secondary] = Cards.Faction1.AltGeneral
f1GO[FactionFactory.GeneralOrder.Tertiary] = Cards.Faction1.ThirdGeneral

f1OG = fmap[Factions.Faction1].generalOrderByIds
f1OG[Cards.Faction1.General] = FactionFactory.GeneralOrder.Primary
f1OG[Cards.Faction1.AltGeneral] = FactionFactory.GeneralOrder.Secondary
f1OG[Cards.Faction1.ThirdGeneral] = FactionFactory.GeneralOrder.Tertiary

#f1 callouts
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
f1C = fmap[Factions.Faction1].generalTauntCallouts
f1C[Factions.Neutral] = i18next.t("factions.faction_1_taunt_neutral")
f1C[Factions.Faction1] = i18next.t("factions.faction_1_taunt_f1")
f1C[Factions.Faction2] = i18next.t("factions.faction_1_taunt_f2")
f1C[Factions.Faction3] = i18next.t("factions.faction_1_taunt_f3")
f1C[Factions.Faction4] = i18next.t("factions.faction_1_taunt_f4")
f1C[Factions.Faction5] = i18next.t("factions.faction_1_taunt_f5")
f1C[Factions.Faction6] = i18next.t("factions.faction_1_taunt_f6")
f1C[Factions.Boss] = i18next.t("factions.faction_1_taunt_boss")

#f1 responses
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
f1R = fmap[Factions.Faction1].generalTauntResponses
f1R[Factions.Neutral] = i18next.t("factions.faction_1_response_neutral")
f1R[Factions.Faction1] = i18next.t("factions.faction_1_response_f1")
f1R[Factions.Faction2] = i18next.t("factions.faction_1_response_f2")
f1R[Factions.Faction3] = i18next.t("factions.faction_1_response_f3")
f1R[Factions.Faction4] = i18next.t("factions.faction_1_response_f4")
f1R[Factions.Faction5] = i18next.t("factions.faction_1_response_f5")
f1R[Factions.Faction6] = i18next.t("factions.faction_1_response_f6")
f1R[Factions.Boss] = i18next.t("factions.faction_1_response_boss")

# f2
fmap[Factions.Faction2] =
  id: Factions.Faction2
  fxResource: ["FX.Factions.Neutral", "FX.Factions.Faction2"]
  name: i18next.t("factions.faction_2_name")
  short_name: i18next.t("factions.faction_2_abbreviated_name")
  description: i18next.t("factions.faction_2_description")
  devName: "songhai"
  isNeutral: false
  enabled: true
  isInDevelopment: false
  generalTauntCallouts: {}
  generalTauntResponses: {}
  generalIds: [Cards.Faction2.General, Cards.Faction2.AltGeneral, Cards.Faction2.ThirdGeneral]
  generalIdsByOrder: {}
  generalOrderByIds: {}
  resignStatement: i18next.t("factions.faction_1_resign_statement")
  crestResource: RSX.crest_f2
  crestShadowResource: RSX.crest_f2_shadow
  crestDeckSelectResource: RSX.crest_f2_deck_select
  gradientColorMapWhite: {r: 254, g: 80, b: 100, a: 255}
  gradientColorMapBlack: {r: 70, g: 5, b: 1, a: 255}

  starterDeck: [
    {id: Cards.Faction2.General},
    {id: Cards.Artifact.MaskOfBloodLeech},
    {id: Cards.Artifact.MaskOfBloodLeech},
    {id: Cards.Artifact.MaskOfBloodLeech},
    {id: Cards.Spell.KillingEdge},
    {id: Cards.Spell.KillingEdge},
    {id: Cards.Spell.KillingEdge},
    {id: Cards.Faction2.KaidoAssassin},
    {id: Cards.Faction2.KaidoAssassin},
    {id: Cards.Faction2.KaidoAssassin},
    {id: Cards.Spell.PhoenixFire},
    {id: Cards.Spell.PhoenixFire},
    {id: Cards.Spell.PhoenixFire},
    {id: Cards.Neutral.SaberspineTiger},
    {id: Cards.Neutral.PrimusShieldmaster},
    {id: Cards.Faction2.Widowmaker},
    {id: Cards.Faction2.Widowmaker},
    {id: Cards.Faction2.Widowmaker},
    {id: Cards.Neutral.HailstoneGolem},
    {id: Cards.Neutral.HailstoneGolem},
    {id: Cards.Neutral.ThornNeedler},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.Bloodletter},
    {id: Cards.Neutral.Bloodletter},
    {id: Cards.Neutral.Bloodletter},
    {id: Cards.Neutral.DragoneboneGolem},
    {id: Cards.Neutral.DragoneboneGolem}
  ]

# f2 general data
f2GO = fmap[Factions.Faction2].generalIdsByOrder
f2GO[FactionFactory.GeneralOrder.Primary] = Cards.Faction2.General
f2GO[FactionFactory.GeneralOrder.Secondary] = Cards.Faction2.AltGeneral
f2GO[FactionFactory.GeneralOrder.Tertiary] = Cards.Faction2.ThirdGeneral

f2OG = fmap[Factions.Faction2].generalOrderByIds
f2OG[Cards.Faction2.General] = FactionFactory.GeneralOrder.Primary
f2OG[Cards.Faction2.AltGeneral] = FactionFactory.GeneralOrder.Secondary
f2OG[Cards.Faction2.ThirdGeneral] = FactionFactory.GeneralOrder.Tertiary

#f2 callouts
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
f2C = fmap[Factions.Faction2].generalTauntCallouts
f2C[Factions.Neutral] = i18next.t("factions.faction_2_taunt_neutral")
f2C[Factions.Faction1] = i18next.t("factions.faction_2_taunt_f1")
f2C[Factions.Faction2] = i18next.t("factions.faction_2_taunt_f2")
f2C[Factions.Faction3] = i18next.t("factions.faction_2_taunt_f3")
f2C[Factions.Faction4] = i18next.t("factions.faction_2_taunt_f4")
f2C[Factions.Faction5] = i18next.t("factions.faction_2_taunt_f5")
f2C[Factions.Faction6] = i18next.t("factions.faction_2_taunt_f6")
f2C[Factions.Boss] = i18next.t("factions.faction_2_taunt_boss")

#f2 responses
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
f2R = fmap[Factions.Faction2].generalTauntResponses
f2R[Factions.Neutral] = i18next.t("factions.faction_2_response_neutral")
f2R[Factions.Faction1] = i18next.t("factions.faction_2_response_f1")
f2R[Factions.Faction2] = i18next.t("factions.faction_2_response_f2")
f2R[Factions.Faction3] = i18next.t("factions.faction_2_response_f3")
f2R[Factions.Faction4] = i18next.t("factions.faction_2_response_f4")
f2R[Factions.Faction5] = i18next.t("factions.faction_2_response_f5")
f2R[Factions.Faction6] = i18next.t("factions.faction_2_response_f6")
f2R[Factions.Boss] = i18next.t("factions.faction_2_response_boss")

# f3
fmap[Factions.Faction3] =
  id: Factions.Faction3
  fxResource: ["FX.Factions.Neutral", "FX.Factions.Faction3"]
  name: i18next.t("factions.faction_3_name")
  short_name: i18next.t("factions.faction_3_abbreviated_name")
  description: i18next.t("factions.faction_3_description")
  devName: "vetruvian"
  isNeutral: false
  enabled: true
  isInDevelopment: false
  generalTauntCallouts: {}
  generalTauntResponses: {}
  generalIds: [Cards.Faction3.General, Cards.Faction3.AltGeneral, Cards.Faction3.ThirdGeneral]
  generalIdsByOrder: {}
  generalOrderByIds: {}
  resignStatement: i18next.t("factions.faction_1_resign_statement")
  crestResource: RSX.crest_f3
  crestShadowResource: RSX.crest_f3_shadow
  crestDeckSelectResource: RSX.crest_f3_deck_select
  gradientColorMapWhite: {r: 250, g: 160, b: 0, a: 255}
  gradientColorMapBlack: {r: 39, g: 33, b: 21, a: 255}

  starterDeck: [
    {id: Cards.Faction3.General},
    {id: Cards.Spell.ScionsFirstWish},
    {id: Cards.Spell.ScionsFirstWish},
    {id: Cards.Spell.ScionsFirstWish},
    {id: Cards.Faction3.Pyromancer},
    {id: Cards.Faction3.Pyromancer},
    {id: Cards.Faction3.Pyromancer},
    {id: Cards.Artifact.StaffOfYKir},
    {id: Cards.Artifact.StaffOfYKir},
    {id: Cards.Artifact.StaffOfYKir},
    {id: Cards.Neutral.BloodshardGolem},
    {id: Cards.Neutral.SaberspineTiger},
    {id: Cards.Neutral.PutridMindflayer},
    {id: Cards.Spell.EntropicDecay},
    {id: Cards.Spell.EntropicDecay},
    {id: Cards.Spell.EntropicDecay},
    {id: Cards.Faction3.WindShrike},
    {id: Cards.Faction3.WindShrike},
    {id: Cards.Faction3.WindShrike},
    {id: Cards.Neutral.HailstoneGolem},
    {id: Cards.Neutral.PrimusShieldmaster},
    {id: Cards.Neutral.PrimusShieldmaster},
    {id: Cards.Neutral.StormmetalGolem},
    {id: Cards.Neutral.StormmetalGolem},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.DragoneboneGolem},
    {id: Cards.Neutral.DragoneboneGolem}
  ]

# f3 general data
f3GO = fmap[Factions.Faction3].generalIdsByOrder
f3GO[FactionFactory.GeneralOrder.Primary] = Cards.Faction3.General
f3GO[FactionFactory.GeneralOrder.Secondary] = Cards.Faction3.AltGeneral
f3GO[FactionFactory.GeneralOrder.Tertiary] = Cards.Faction3.ThirdGeneral

f3OG = fmap[Factions.Faction3].generalOrderByIds
f3OG[Cards.Faction3.General] = FactionFactory.GeneralOrder.Primary
f3OG[Cards.Faction3.AltGeneral] = FactionFactory.GeneralOrder.Secondary
f3OG[Cards.Faction3.ThirdGeneral] = FactionFactory.GeneralOrder.Tertiary

#f3 callouts
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
f3C = fmap[Factions.Faction3].generalTauntCallouts
f3C[Factions.Neutral] = i18next.t("factions.faction_3_taunt_neutral")
f3C[Factions.Faction1] = i18next.t("factions.faction_3_taunt_f1")
f3C[Factions.Faction2] = i18next.t("factions.faction_3_taunt_f2")
f3C[Factions.Faction3] = i18next.t("factions.faction_3_taunt_f3")
f3C[Factions.Faction4] = i18next.t("factions.faction_3_taunt_f4")
f3C[Factions.Faction5] = i18next.t("factions.faction_3_taunt_f5")
f3C[Factions.Faction6] = i18next.t("factions.faction_3_taunt_f6")
f3C[Factions.Boss] = i18next.t("factions.faction_3_taunt_boss")

#f3 responses
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
f3R = fmap[Factions.Faction3].generalTauntResponses
f3R[Factions.Neutral] = i18next.t("factions.faction_3_response_neutral")
f3R[Factions.Faction1] = i18next.t("factions.faction_3_response_f1")
f3R[Factions.Faction2] = i18next.t("factions.faction_3_response_f2")
f3R[Factions.Faction3] = i18next.t("factions.faction_3_response_f3")
f3R[Factions.Faction4] = i18next.t("factions.faction_3_response_f4")
f3R[Factions.Faction5] = i18next.t("factions.faction_3_response_f5")
f3R[Factions.Faction6] = i18next.t("factions.faction_3_response_f6")
f3R[Factions.Boss] = i18next.t("factions.faction_3_response_boss")

# f4
fmap[Factions.Faction4] =
  id: Factions.Faction4
  fxResource: ["FX.Factions.Neutral", "FX.Factions.Faction4"]
  name: i18next.t("factions.faction_4_name")
  short_name: i18next.t("factions.faction_4_abbreviated_name")
  description: i18next.t("factions.faction_4_description")
  devName: "abyssian"
  isNeutral: false
  enabled: true
  isInDevelopment: false
  generalTauntCallouts: {}
  generalTauntResponses: {}
  generalIds: [Cards.Faction4.General, Cards.Faction4.AltGeneral, Cards.Faction4.ThirdGeneral]
  generalIdsByOrder: {}
  generalOrderByIds: {}
  resignStatement: i18next.t("factions.faction_1_resign_statement")
  crestResource: RSX.crest_f4
  crestShadowResource: RSX.crest_f4_shadow
  crestDeckSelectResource: RSX.crest_f4_deck_select
  gradientColorMapWhite: {r: 247, g: 151, b: 254, a: 255}
  gradientColorMapBlack: {r: 45, g: 50, b: 167, a: 255}

  starterDeck: [
    {id: Cards.Faction4.General},
    {id: Cards.Artifact.HornOfTheForsaken},
    {id: Cards.Artifact.HornOfTheForsaken},
    {id: Cards.Artifact.HornOfTheForsaken},
    {id: Cards.Faction4.GloomChaser},
    {id: Cards.Faction4.GloomChaser},
    {id: Cards.Faction4.GloomChaser},
    {id: Cards.Faction4.ShadowWatcher},
    {id: Cards.Faction4.ShadowWatcher},
    {id: Cards.Faction4.ShadowWatcher},
    {id: Cards.Spell.WraithlingSwarm},
    {id: Cards.Spell.WraithlingSwarm},
    {id: Cards.Spell.WraithlingSwarm},
    {id: Cards.Neutral.PutridMindflayer},
    {id: Cards.Neutral.HailstoneGolem},
    {id: Cards.Neutral.HailstoneGolem},
    {id: Cards.Neutral.ThornNeedler},
    {id: Cards.Neutral.ThornNeedler},
    {id: Cards.Spell.DarkTransformation},
    {id: Cards.Spell.DarkTransformation},
    {id: Cards.Spell.DarkTransformation},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.StormmetalGolem},
    {id: Cards.Neutral.StormmetalGolem},
    {id: Cards.Neutral.DragoneboneGolem},
    {id: Cards.Neutral.DragoneboneGolem}
  ]

# f4 general data
f4GO = fmap[Factions.Faction4].generalIdsByOrder
f4GO[FactionFactory.GeneralOrder.Primary] = Cards.Faction4.General
f4GO[FactionFactory.GeneralOrder.Secondary] = Cards.Faction4.AltGeneral
f4GO[FactionFactory.GeneralOrder.Tertiary] = Cards.Faction4.ThirdGeneral

f4OG = fmap[Factions.Faction4].generalOrderByIds
f4OG[Cards.Faction4.General] = FactionFactory.GeneralOrder.Primary
f4OG[Cards.Faction4.AltGeneral] = FactionFactory.GeneralOrder.Secondary
f4OG[Cards.Faction4.ThirdGeneral] = FactionFactory.GeneralOrder.Tertiary

#f4 callouts
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
f4C = fmap[Factions.Faction4].generalTauntCallouts
f4C[Factions.Neutral] = i18next.t("factions.faction_4_taunt_neutral")
f4C[Factions.Faction1] = i18next.t("factions.faction_4_taunt_f1")
f4C[Factions.Faction2] = i18next.t("factions.faction_4_taunt_f2")
f4C[Factions.Faction3] = i18next.t("factions.faction_4_taunt_f3")
f4C[Factions.Faction4] = i18next.t("factions.faction_4_taunt_f4")
f4C[Factions.Faction5] = i18next.t("factions.faction_4_taunt_f5")
f4C[Factions.Faction6] = i18next.t("factions.faction_4_taunt_f6")
f4C[Factions.Boss] = i18next.t("factions.faction_4_taunt_boss")

#f4 responses
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
f4R = fmap[Factions.Faction4].generalTauntResponses
f4R[Factions.Neutral] = i18next.t("factions.faction_4_response_neutral")
f4R[Factions.Faction1] = i18next.t("factions.faction_4_response_f1")
f4R[Factions.Faction2] = i18next.t("factions.faction_4_response_f2")
f4R[Factions.Faction3] = i18next.t("factions.faction_4_response_f3")
f4R[Factions.Faction4] = i18next.t("factions.faction_4_response_f4")
f4R[Factions.Faction5] = i18next.t("factions.faction_4_response_f5")
f4R[Factions.Faction6] = i18next.t("factions.faction_4_response_f6")
f4R[Factions.Boss] = i18next.t("factions.faction_4_response_boss")

# f5
fmap[Factions.Faction5] =
  id: Factions.Faction5
  fxResource: ["FX.Factions.Neutral", "FX.Factions.Faction5"]
  name: i18next.t("factions.faction_5_name")
  short_name: i18next.t("factions.faction_5_abbreviated_name")
  description: i18next.t("factions.faction_5_description")
  devName: "magmar"
  isNeutral: false
  enabled: true
  isInDevelopment: false
  generalTauntCallouts: {}
  generalTauntResponses: {}
  generalIds: [Cards.Faction5.General, Cards.Faction5.AltGeneral, Cards.Faction5.ThirdGeneral]
  generalIdsByOrder: {}
  generalOrderByIds: {}
  resignStatement: i18next.t("factions.faction_1_resign_statement")
  crestResource: RSX.crest_f5
  crestShadowResource: RSX.crest_f5_shadow
  crestDeckSelectResource: RSX.crest_f5_deck_select
  gradientColorMapWhite: {r: 0, g: 252, b: 250, a: 255}
  gradientColorMapBlack: {r: 0, g: 62, b: 66, a: 255}

  starterDeck: [
    {id: Cards.Faction5.General},
    {id: Cards.Spell.GreaterFortitude},
    {id: Cards.Spell.GreaterFortitude},
    {id: Cards.Spell.GreaterFortitude},
    {id: Cards.Spell.NaturalSelection},
    {id: Cards.Spell.NaturalSelection},
    {id: Cards.Spell.NaturalSelection},
    {id: Cards.Faction5.Phalanxar},
    {id: Cards.Faction5.Phalanxar},
    {id: Cards.Faction5.Phalanxar},
    {id: Cards.Neutral.BloodshardGolem},
    {id: Cards.Neutral.PutridMindflayer},
    {id: Cards.Faction5.EarthWalker},
    {id: Cards.Faction5.EarthWalker},
    {id: Cards.Faction5.EarthWalker},
    {id: Cards.Neutral.SaberspineTiger},
    {id: Cards.Artifact.AdamantineClaws},
    {id: Cards.Artifact.AdamantineClaws},
    {id: Cards.Artifact.AdamantineClaws},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.BrightmossGolem},
    {id: Cards.Neutral.StormmetalGolem},
    {id: Cards.Neutral.StormmetalGolem},
    {id: Cards.Neutral.Bloodletter},
    {id: Cards.Neutral.DragoneboneGolem},
    {id: Cards.Neutral.DragoneboneGolem}
  ]

# f5 general data
f5GO = fmap[Factions.Faction5].generalIdsByOrder
f5GO[FactionFactory.GeneralOrder.Primary] = Cards.Faction5.General
f5GO[FactionFactory.GeneralOrder.Secondary] = Cards.Faction5.AltGeneral
f5GO[FactionFactory.GeneralOrder.Tertiary] = Cards.Faction5.ThirdGeneral

f5OG = fmap[Factions.Faction5].generalOrderByIds
f5OG[Cards.Faction5.General] = FactionFactory.GeneralOrder.Primary
f5OG[Cards.Faction5.AltGeneral] = FactionFactory.GeneralOrder.Secondary
f5OG[Cards.Faction5.ThirdGeneral] = FactionFactory.GeneralOrder.Tertiary

#f5 callouts
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
f5C = fmap[Factions.Faction5].generalTauntCallouts
f5C[Factions.Neutral] = i18next.t("factions.faction_5_taunt_neutral")
f5C[Factions.Faction1] = i18next.t("factions.faction_5_taunt_f1")
f5C[Factions.Faction2] = i18next.t("factions.faction_5_taunt_f2")
f5C[Factions.Faction3] = i18next.t("factions.faction_5_taunt_f3")
f5C[Factions.Faction4] = i18next.t("factions.faction_5_taunt_f4")
f5C[Factions.Faction5] = i18next.t("factions.faction_5_taunt_f5")
f5C[Factions.Faction6] = i18next.t("factions.faction_5_taunt_f6")
f5C[Factions.Boss] = i18next.t("factions.faction_5_taunt_boss")

#f5 responses
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
f5R = fmap[Factions.Faction5].generalTauntResponses
f5R[Factions.Neutral] = i18next.t("factions.faction_5_response_neutral")
f5R[Factions.Faction1] = i18next.t("factions.faction_5_response_f1")
f5R[Factions.Faction2] = i18next.t("factions.faction_5_response_f2")
f5R[Factions.Faction3] = i18next.t("factions.faction_5_response_f3")
f5R[Factions.Faction4] = i18next.t("factions.faction_5_response_f4")
f5R[Factions.Faction5] = i18next.t("factions.faction_5_response_f5")
f5R[Factions.Faction6] = i18next.t("factions.faction_5_response_f6")
f5R[Factions.Boss] = i18next.t("factions.faction_5_response_boss")

# f6
fmap[Factions.Faction6] =
  id: Factions.Faction6
  fxResource: ["FX.Factions.Neutral", "FX.Factions.Faction6"]
  name: i18next.t("factions.faction_6_name")
  short_name: i18next.t("factions.faction_6_abbreviated_name")
  description: i18next.t("factions.faction_6_description")
  devName: "vanar"
  isNeutral: false
  enabled: true
  isInDevelopment: false
  generalTauntCallouts: {}
  generalTauntResponses: {}
  generalIds: [Cards.Faction6.General, Cards.Faction6.AltGeneral, Cards.Faction6.ThirdGeneral]
  generalIdsByOrder: {}
  generalOrderByIds: {}
  resignStatement: i18next.t("factions.faction_1_resign_statement")
  crestResource: RSX.crest_f6
  crestShadowResource: RSX.crest_f6_shadow
  crestDeckSelectResource: RSX.crest_f6_deck_select
  gradientColorMapWhite: {r: 185, g: 208, b: 226, a: 255}
  gradientColorMapBlack: {r: 9, g: 12, b: 55, a: 255}

  starterDeck: [
    {id: Cards.Faction6.General},
    {id: Cards.Spell.FlashFreeze},
    {id: Cards.Spell.FlashFreeze},
    {id: Cards.Spell.FlashFreeze},
    {id: Cards.Faction6.CrystalCloaker},
    {id: Cards.Faction6.CrystalCloaker},
    {id: Cards.Faction6.CrystalCloaker},
    {id: Cards.Spell.PermafrostShield},
    {id: Cards.Spell.PermafrostShield},
    {id: Cards.Spell.PermafrostShield},
    {id: Cards.Artifact.Snowpiercer},
    {id: Cards.Artifact.Snowpiercer},
    {id: Cards.Artifact.Snowpiercer},
    {id: Cards.Neutral.PutridMindflayer},
    {id: Cards.Neutral.FlameWing},
    {id: Cards.Neutral.FlameWing},
    {id: Cards.Neutral.HailstoneGolem},
    {id: Cards.Neutral.PrimusShieldmaster},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Neutral.Necroseer},
    {id: Cards.Faction6.ArcticDisplacer},
    {id: Cards.Faction6.ArcticDisplacer},
    {id: Cards.Faction6.ArcticDisplacer},
    {id: Cards.Neutral.StormmetalGolem},
    {id: Cards.Neutral.StormmetalGolem},
    {id: Cards.Neutral.Bloodletter},
    {id: Cards.Neutral.DragoneboneGolem},
    {id: Cards.Neutral.DragoneboneGolem}
  ]

# f6 general data
f6GO = fmap[Factions.Faction6].generalIdsByOrder
f6GO[FactionFactory.GeneralOrder.Primary] = Cards.Faction6.General
f6GO[FactionFactory.GeneralOrder.Secondary] = Cards.Faction6.AltGeneral
f6GO[FactionFactory.GeneralOrder.Tertiary] = Cards.Faction6.ThirdGeneral

f6OG = fmap[Factions.Faction6].generalOrderByIds
f6OG[Cards.Faction6.General] = FactionFactory.GeneralOrder.Primary
f6OG[Cards.Faction6.AltGeneral] = FactionFactory.GeneralOrder.Secondary
f6OG[Cards.Faction6.ThirdGeneral] = FactionFactory.GeneralOrder.Tertiary

#f6 callouts
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
f6C = fmap[Factions.Faction6].generalTauntCallouts
f6C[Factions.Neutral] = i18next.t("factions.faction_6_taunt_neutral")
f6C[Factions.Faction1] = i18next.t("factions.faction_6_taunt_f1")
f6C[Factions.Faction2] = i18next.t("factions.faction_6_taunt_f2")
f6C[Factions.Faction3] = i18next.t("factions.faction_6_taunt_f3")
f6C[Factions.Faction4] = i18next.t("factions.faction_6_taunt_f4")
f6C[Factions.Faction5] = i18next.t("factions.faction_6_taunt_f5")
f6C[Factions.Faction6] = i18next.t("factions.faction_6_taunt_f6")
f6C[Factions.Boss] = i18next.t("factions.faction_6_taunt_boss")

#f6 responses
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
f6R = fmap[Factions.Faction6].generalTauntResponses
f6R[Factions.Neutral] = i18next.t("factions.faction_6_response_neutral")
f6R[Factions.Faction1] = i18next.t("factions.faction_6_response_f1")
f6R[Factions.Faction2] = i18next.t("factions.faction_6_response_f2")
f6R[Factions.Faction3] = i18next.t("factions.faction_6_response_f3")
f6R[Factions.Faction4] = i18next.t("factions.faction_6_response_f4")
f6R[Factions.Faction5] = i18next.t("factions.faction_6_response_f5")
f6R[Factions.Faction6] = i18next.t("factions.faction_6_response_f6")
f6R[Factions.Boss] = i18next.t("factions.faction_6_response_boss")

# neutral
fmap[Factions.Neutral] =
  id: Factions.Neutral
  fxResource: ["FX.Factions.Neutral"]
  name: i18next.t("factions.faction_neutral_name")
  short_name: i18next.t("factions.faction_neutral_abbreviated_name")
  devName: "neutral"
  description: ""
  isNeutral: true
  enabled: true
  isInDevelopment: false

# tutorial faction
fmap[Factions.Tutorial] =
  id: Factions.Tutorial
  fxResource: ["FX.Factions.Neutral", "FX.Factions.Tutorial"]
  name: "Tutorial Teacher"
  devName: "tutorial"
  description: "The Teacher of Duelyst"
  gameCountFlavorText: "N/A"
  isNeutral: false
  enabled: false
  isInDevelopment: false
  generalIds: [
    Cards.Tutorial.TutorialGeneral,
    Cards.Tutorial.TutorialSignatureGeneral,
    Cards.Tutorial.TutorialOpponentGeneral1,
    Cards.Tutorial.TutorialOpponentGeneral2,
    Cards.Tutorial.TutorialOpponentGeneral4
  ]
  announcerFirst: null # TODO: audio
  announcerSecond: null # TODO: audio
  gradientColorMapWhite: {r: 255, g: 255, b: 255, a: 255}
  gradientColorMapBlack: {r: 0, g: 0, b: 0, a: 255}

# bosses faction
fmap[Factions.Boss] =
  id: Factions.Boss
  fxResource: ["FX.Factions.Neutral", "FX.Factions.Boss"]
  name: "Boss"
  devName: "bosses"
  description: "Mysterious Challengers"
  isNeutral: false
  enabled: false
  isInDevelopment: false

  generalTauntCallouts: {}
  generalTauntResponses: {}
  generalIds: [
    Cards.Boss.Boss38,
    Cards.Boss.Boss37,
    Cards.Boss.Boss36,
    Cards.Boss.Boss35,
    Cards.Boss.Boss34,
    Cards.Boss.Boss33,
    Cards.Boss.Boss32,
    Cards.Boss.Boss31,
    Cards.Boss.Boss30,
    Cards.Boss.Boss29,
    Cards.Boss.Boss28,
    Cards.Boss.Boss27,
    Cards.Boss.Boss26,
    Cards.Boss.Boss25,
    Cards.Boss.Boss24,
    Cards.Boss.Boss23,
    Cards.Boss.Boss22,
    Cards.Boss.Boss21,
    Cards.Boss.Boss20,
    Cards.Boss.Boss19,
    Cards.Boss.Boss18,
    Cards.Boss.Boss17,
    Cards.Boss.Boss16,
    Cards.Boss.Boss15,
    Cards.Boss.Boss14,
    Cards.Boss.Boss13,
    Cards.Boss.Boss12,
    Cards.Boss.Boss11,
    Cards.Boss.Boss10,
    Cards.Boss.Boss6,
    Cards.Boss.Boss9,
    Cards.Boss.Boss2,
    Cards.Boss.Boss4,
    Cards.Boss.Boss5,
    Cards.Boss.Boss1,
    Cards.Boss.Boss7,
    Cards.Boss.Boss8,
    Cards.Boss.Boss3
  ]
  generalIdsByOrder: {}
  generalOrderByIds: {}
  resignStatement: i18next.t("factions.generic_concede")
  gameCountFlavorText: "N/A"
  crestImg: null
  crestShadowImg: null
  crestDeckSelectImg: null
  gradientColorMapWhite: {r: 255, g: 255, b: 255, a: 255}
  gradientColorMapBlack: {r: 0, g: 0, b: 0, a: 255}

#boss callouts
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
fbC = fmap[Factions.Boss].generalTauntCallouts
fbC[Factions.Neutral] = i18next.t("factions.boss_neutral_taunt")
# specific boss callouts
fbC1 = fbC[Cards.Boss.Boss1] = {}
fbC1[Factions.Neutral] = i18next.t("factions.boss_1_taunt")
fbC2 = fbC[Cards.Boss.Boss2] = {}
fbC2[Factions.Neutral] = i18next.t("factions.boss_2_taunt")
fbC3 = fbC[Cards.Boss.Boss3] = fbC[Cards.Boss.Boss7] = {}
fbC3[Factions.Neutral] = i18next.t("factions.boss_3_taunt")
fbC4 = fbC[Cards.Boss.Boss4] = {}
fbC4[Factions.Neutral] = i18next.t("factions.boss_4_taunt")
fbC5 = fbC[Cards.Boss.Boss5] = {}
fbC5[Factions.Neutral] = i18next.t("factions.boss_5_taunt")
fbC6 = fbC[Cards.Boss.Boss6] = {}
fbC6[Factions.Neutral] = i18next.t("factions.boss_6_taunt")
fbC8 = fbC[Cards.Boss.Boss8] = {}
fbC8[Factions.Neutral] = i18next.t("factions.boss_8_taunt")
fbC9 = fbC[Cards.Boss.Boss9] = {}
fbC9[Factions.Neutral] = i18next.t("factions.boss_9_taunt")
fbC10 = fbC[Cards.Boss.Boss10] = {}
fbC10[Factions.Neutral] = i18next.t("factions.boss_10_taunt")
fbC11 = fbC[Cards.Boss.Boss11] = {}
fbC11[Factions.Neutral] = i18next.t("factions.boss_11_taunt")
fbC12 = fbC[Cards.Boss.Boss12] = {}
fbC12[Factions.Neutral] = i18next.t("factions.boss_12_taunt")
fbC13 = fbC[Cards.Boss.Boss13] = {}
fbC13[Factions.Neutral] = i18next.t("factions.boss_13_taunt")
fbC14 = fbC[Cards.Boss.Boss14] = {}
fbC14[Factions.Neutral] = i18next.t("factions.boss_14_taunt")
fbC15 = fbC[Cards.Boss.Boss15] = {}
fbC15[Factions.Neutral] = i18next.t("factions.boss_15_taunt")
fbC16 = fbC[Cards.Boss.Boss16] = {}
fbC16[Factions.Neutral] = i18next.t("factions.boss_16_taunt")
fbC17 = fbC[Cards.Boss.Boss17] = {}
fbC17[Factions.Neutral] = i18next.t("factions.boss_17_taunt")
fbC18 = fbC[Cards.Boss.Boss18] = {}
fbC18[Factions.Neutral] = i18next.t("factions.boss_18_taunt")
fbC19 = fbC[Cards.Boss.Boss19] = {}
fbC19[Factions.Neutral] = i18next.t("factions.boss_19_taunt")
fbC20 = fbC[Cards.Boss.Boss20] = {}
fbC20[Factions.Neutral] = i18next.t("factions.boss_20_taunt")
fbC21 = fbC[Cards.Boss.Boss21] = {}
fbC21[Factions.Neutral] = i18next.t("factions.boss_21_taunt")
fbC22 = fbC[Cards.Boss.Boss22] = {}
fbC22[Factions.Neutral] = i18next.t("factions.boss_22_taunt")
fbC23 = fbC[Cards.Boss.Boss23] = {}
fbC23[Factions.Neutral] = i18next.t("factions.boss_23_taunt")
fbC24 = fbC[Cards.Boss.Boss24] = {}
fbC24[Factions.Neutral] = i18next.t("factions.boss_24_taunt")
fbC25 = fbC[Cards.Boss.Boss25] = {}
fbC25[Factions.Neutral] = i18next.t("factions.boss_25_taunt")
fbC26 = fbC[Cards.Boss.Boss26] = {}
fbC26[Factions.Neutral] = i18next.t("factions.boss_26_taunt")
fbC27 = fbC[Cards.Boss.Boss27] = {}
fbC27[Factions.Neutral] = i18next.t("factions.boss_27_taunt")
fbC28 = fbC[Cards.Boss.Boss28] = {}
fbC28[Factions.Neutral] = i18next.t("factions.boss_28_taunt")
fbC29 = fbC[Cards.Boss.Boss29] = {}
fbC29[Factions.Neutral] = i18next.t("factions.boss_29_taunt")
fbC30 = fbC[Cards.Boss.Boss30] = {}
fbC30[Factions.Neutral] = i18next.t("factions.boss_30_taunt")
fbC31 = fbC[Cards.Boss.Boss31] = {}
fbC31[Factions.Neutral] = i18next.t("factions.boss_31_taunt")
fbC32 = fbC[Cards.Boss.Boss32] = {}
fbC32[Factions.Neutral] = i18next.t("factions.boss_32_taunt")
fbC33 = fbC[Cards.Boss.Boss33] = {}
fbC33[Factions.Neutral] = i18next.t("factions.boss_33_taunt")
fbC34 = fbC[Cards.Boss.Boss34] = {}
fbC34[Factions.Neutral] = i18next.t("factions.boss_34_taunt")
fbC35 = fbC[Cards.Boss.Boss35] = {}
fbC35[Factions.Neutral] = i18next.t("factions.boss_35_taunt")
fbC36 = fbC[Cards.Boss.Boss36] = {}
fbC36[Factions.Neutral] = i18next.t("factions.boss_36_taunt")
fbC37 = fbC[Cards.Boss.Boss37] = {}
fbC37[Factions.Neutral] = i18next.t("factions.boss_37_taunt")
fbC38 = fbC[Cards.Boss.Boss38] = {}
fbC38[Factions.Neutral] = i18next.t("factions.boss_38_taunt")

#boss responses
# adding a sub map keyed by general id to this map
# will use those instead when my general is that general
fbR = fmap[Factions.Boss].generalTauntResponses
fbR[Factions.Neutral] = i18next.t("factions.boss_neutral_taunt")
# specific boss callouts
fbR1 = fbR[Cards.Boss.Boss1] = {}
fbR1[Factions.Neutral] = i18next.t("factions.boss_1_taunt")
fbR2 = fbR[Cards.Boss.Boss2] = {}
fbR2[Factions.Neutral] = i18next.t("factions.boss_2_taunt")
fbR3 = fbR[Cards.Boss.Boss3] = fbR[Cards.Boss.Boss7] = {}
fbR3[Factions.Neutral] = i18next.t("factions.boss_3_taunt")
fbR4 = fbR[Cards.Boss.Boss4] = {}
fbR4[Factions.Neutral] = i18next.t("factions.boss_4_taunt")
fbR5 = fbR[Cards.Boss.Boss5] = {}
fbR5[Factions.Neutral] = i18next.t("factions.boss_5_taunt")
fbR6 = fbR[Cards.Boss.Boss6] = {}
fbR6[Factions.Neutral] = i18next.t("factions.boss_6_taunt")
fbR8 = fbR[Cards.Boss.Boss8] = {}
fbR8[Factions.Neutral] = i18next.t("factions.boss_8_taunt")
fbR9 = fbR[Cards.Boss.Boss9] = {}
fbR9[Factions.Neutral] = i18next.t("factions.boss_9_taunt")
fbR10 = fbR[Cards.Boss.Boss10] = {}
fbR10[Factions.Neutral] = i18next.t("factions.boss_10_taunt")
fbR11 = fbR[Cards.Boss.Boss11] = {}
fbR11[Factions.Neutral] = i18next.t("factions.boss_11_taunt")
fbR12 = fbR[Cards.Boss.Boss12] = {}
fbR12[Factions.Neutral] = i18next.t("factions.boss_12_taunt")
fbR13 = fbR[Cards.Boss.Boss13] = {}
fbR13[Factions.Neutral] = i18next.t("factions.boss_13_taunt")
fbR14 = fbR[Cards.Boss.Boss14] = {}
fbR14[Factions.Neutral] = i18next.t("factions.boss_14_taunt")
fbR15 = fbR[Cards.Boss.Boss15] = {}
fbR15[Factions.Neutral] = i18next.t("factions.boss_15_taunt")
fbR16 = fbR[Cards.Boss.Boss16] = {}
fbR16[Factions.Neutral] = i18next.t("factions.boss_16_taunt")
fbR17 = fbR[Cards.Boss.Boss17] = {}
fbR17[Factions.Neutral] = i18next.t("factions.boss_17_taunt")
fbR18 = fbR[Cards.Boss.Boss18] = {}
fbR18[Factions.Neutral] = i18next.t("factions.boss_18_taunt")
fbR19 = fbR[Cards.Boss.Boss19] = {}
fbR19[Factions.Neutral] = i18next.t("factions.boss_19_taunt")
fbR20 = fbR[Cards.Boss.Boss20] = {}
fbR20[Factions.Neutral] = i18next.t("factions.boss_20_taunt")
fbR21 = fbR[Cards.Boss.Boss21] = {}
fbR21[Factions.Neutral] = i18next.t("factions.boss_21_taunt")
fbR22 = fbR[Cards.Boss.Boss22] = {}
fbR22[Factions.Neutral] = i18next.t("factions.boss_22_taunt")
fbR23 = fbR[Cards.Boss.Boss23] = {}
fbR23[Factions.Neutral] = i18next.t("factions.boss_23_taunt")
fbR24 = fbR[Cards.Boss.Boss24] = {}
fbR24[Factions.Neutral] = i18next.t("factions.boss_24_taunt")
fbR25 = fbR[Cards.Boss.Boss25] = {}
fbR25[Factions.Neutral] = i18next.t("factions.boss_25_taunt")
fbR26 = fbR[Cards.Boss.Boss26] = {}
fbR26[Factions.Neutral] = i18next.t("factions.boss_26_taunt")
fbR27 = fbR[Cards.Boss.Boss27] = {}
fbR27[Factions.Neutral] = i18next.t("factions.boss_27_taunt")
fbR28 = fbR[Cards.Boss.Boss28] = {}
fbR28[Factions.Neutral] = i18next.t("factions.boss_28_taunt")
fbR29 = fbR[Cards.Boss.Boss29] = {}
fbR29[Factions.Neutral] = i18next.t("factions.boss_29_taunt")
fbR30 = fbR[Cards.Boss.Boss30] = {}
fbR30[Factions.Neutral] = i18next.t("factions.boss_30_taunt")
fbR31 = fbR[Cards.Boss.Boss31] = {}
fbR31[Factions.Neutral] = i18next.t("factions.boss_31_taunt")
fbR32 = fbR[Cards.Boss.Boss32] = {}
fbR32[Factions.Neutral] = i18next.t("factions.boss_32_taunt")
fbR33 = fbR[Cards.Boss.Boss33] = {}
fbR33[Factions.Neutral] = i18next.t("factions.boss_33_taunt")
fbR34 = fbR[Cards.Boss.Boss34] = {}
fbR34[Factions.Neutral] = i18next.t("factions.boss_34_taunt")
fbR35 = fbR[Cards.Boss.Boss35] = {}
fbR35[Factions.Neutral] = i18next.t("factions.boss_35_taunt")
fbR36 = fbR[Cards.Boss.Boss36] = {}
fbR36[Factions.Neutral] = i18next.t("factions.boss_36_taunt")
fbR37 = fbR[Cards.Boss.Boss37] = {}
fbR37[Factions.Neutral] = i18next.t("factions.boss_37_taunt")
fbR38 = fbR[Cards.Boss.Boss38] = {}
fbR38[Factions.Neutral] = i18next.t("factions.boss_38_taunt")

module.exports = FactionFactory
