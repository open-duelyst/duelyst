ModifierFate = require './modifierFate'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Rarity = require 'app/sdk/cards/rarityLookup'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
CloneEntityAction = require 'app/sdk/actions/cloneEntityAction'
SwapUnitAllegianceAction = require 'app/sdk/actions/swapUnitAllegianceAction'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayerModifierEmblemSummonWatchVanarTokenQuest = require 'app/sdk/playerModifiers/playerModifierEmblemSummonWatchVanarTokenQuest'
ModifierQuestStatusVanar = require './modifierQuestStatusVanar'

i18next = require('i18next')

class ModifierFateVanarTokenQuest extends ModifierFate

  type:"ModifierFateVanarTokenQuest"
  @type:"ModifierFateVanarTokenQuest"

  numTokensRequired: 1
  numTokensFound: 0

  @createContextObject: (numTokensRequired, options) ->
    contextObject = super(options)
    contextObject.numTokensRequired = numTokensRequired
    return contextObject

  onActivate: () ->
    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    @numTokensFound = @getTokenCount()
    if (general? and general.hasActiveModifierClass(PlayerModifierEmblemSummonWatchVanarTokenQuest)) or @numTokensFound >= @numTokensRequired
      @_private.fateFulfilled = true
      @unlockFateCard()
      if !general.hasActiveModifierClass(ModifierQuestStatusVanar)
        @applyQuestStatusModifier(true)
    else
      if !general.hasActiveModifierClass(ModifierQuestStatusVanar)
        @applyQuestStatusModifier(false)

  updateFateCondition: (action) ->
    if @getIsActionRelevant(action)
      @removeQuestStatusModifier()
      @numTokensFound = @getTokenCount()
      if @numTokensFound >= @numTokensRequired
        @_private.fateFulfilled = true
        super()
        general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
        @applyQuestStatusModifier(true)
      else
        @applyQuestStatusModifier(false)

  getTokenCount: (action) ->

    uniqueTokenIds = []
    numTokensFound = 0
    foundBuildingToken = false
    units = @getGameSession().getBoard().getFriendlyEntitiesForEntity(@getCard(), CardType.Unit)
    for unit in units
      if unit? and !unit.getIsGeneral() and unit.getRarityId() == Rarity.TokenUnit
        unitId = unit.getBaseCardId()
        tokenAlreadyCounted = false
        for tokenId in uniqueTokenIds
          if unitId == tokenId
            tokenAlreadyCounted = true
            break
        if !tokenAlreadyCounted
          if @unitIsABuildingToken(unitId)
            foundBuildingToken = true
          else
            uniqueTokenIds.push(unitId)
          numTokensFound = uniqueTokenIds.length
          if foundBuildingToken
            numTokensFound++
    return numTokensFound

  unitIsABuildingToken: (unitId) ->
    return unitId == Cards.Faction1.VigilatorBuilding or
    unitId == Cards.Faction1.MonumentBuilding or
    unitId == Cards.Faction2.ManakiteBuilding or
    unitId == Cards.Faction2.PenumbraxxBuilding or
    unitId == Cards.Faction3.ShrikeBuilding or
    unitId == Cards.Faction3.SimulacraBuilding or
    unitId == Cards.Faction4.VoidTalonBuilding or
    unitId == Cards.Faction4.GateBuilding or
    unitId == Cards.Faction5.HulkBuilding or
    unitId == Cards.Faction5.GigalothBuilding or
    unitId == Cards.Faction6.ProtosensorBuilding or
    unitId == Cards.Faction6.EyolithBuilding or
    unitId == Cards.Neutral.RescueRXBuilding or
    unitId == Cards.Neutral.ArchitectBuilding

  getIsActionRelevant: (action) ->
    if action instanceof ApplyCardToBoardAction or action instanceof CloneEntityAction or action instanceof SwapUnitAllegianceAction or action instanceof RemoveAction
      return true
    return false

  removeQuestStatusModifier: () ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if general.hasActiveModifierClass(ModifierQuestStatusVanar)
      for mod in general.getModifiersByClass(ModifierQuestStatusVanar)
        @getGameSession().removeModifier(mod)

  applyQuestStatusModifier: (questCompleted) ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    countModifier = ModifierQuestStatusVanar.createContextObject(questCompleted, @numTokensFound)
    @getGameSession().applyModifierContextObject(countModifier, general)

module.exports = ModifierFateVanarTokenQuest
