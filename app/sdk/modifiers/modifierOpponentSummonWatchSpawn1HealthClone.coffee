CONFIG = require 'app/common/config'
UtilsJavascript = require 'app/common/utils/utils_javascript'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
ModifierSummonWatch = require './modifierSummonWatch'
CardType = require 'app/sdk/cards/cardType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'
ModifierOpponentSummonWatch = require './modifierOpponentSummonWatch'
CloneEntityAsTransformAction = require 'app/sdk/actions/cloneEntityAsTransformAction'
Modifier = require './modifier'

class ModifierOpponentSummonWatchSpawn1HealthClone extends ModifierOpponentSummonWatch

  type:"ModifierOpponentSummonWatchSpawn1HealthClone"
  @type:"ModifierOpponentSummonWatchSpawn1HealthClone"

  @modifierName:"Opponent Summon Watch"
  @description:"Whenever an enemy summons a minion, summon a 1 health clone nearby your general"

  cardDataOrIndexToSpawn: null

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (spawnDescription="", spawnCount=1, spawnPattern=CONFIG.PATTERN_3x3, spawnSilently=false, options) ->
    contextObject = super(options)
    contextObject.spawnDescription = spawnDescription
    contextObject.spawnCount = spawnCount
    contextObject.spawnPattern = spawnPattern
    contextObject.spawnSilently = spawnSilently

    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = ""
      if UtilsPosition.getArraysOfPositionsAreEqual(modifierContextObject.spawnPattern, CONFIG.PATTERN_1x1)
        replaceText = "a "+modifierContextObject.spawnDescription+" in the same space"
      else if modifierContextObject.spawnCount == 1
        replaceText = "a "+modifierContextObject.spawnDescription+" into a nearby space"
      else if modifierContextObject.spawnCount == 8
        replaceText = ""+modifierContextObject.spawnDescription+"s in all nearby spaces"
      else
        replaceText = ""+modifierContextObject.spawnDescription+"s into "+modifierContextObject.spawnCount+" nearby spaces"
      return @description.replace /%X/, replaceText
    else
      return @description

  onSummonWatch: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      summonedPosition = action.getTargetPosition()
      ownerId = @getSpawnOwnerId(action)
      cloningEntity = @getEntityToSpawn(summonedPosition.x, summonedPosition.y)
      if cloningEntity?
        @cardDataOrIndexToSpawn = cloningEntity.createNewCardData()
        spawnPositions = UtilsGameSession.getRandomNonConflictingSmartSpawnPositionsForModifier(@, ModifierOpponentSummonWatchSpawn1HealthClone)
        for spawnPosition in spawnPositions
          spawnEntityAction = new CloneEntityAsTransformAction(@getGameSession(), @getOwnerId(), spawnPosition.x, spawnPosition.y)
          spawnEntityAction.setOwnerId(@getSpawnOwnerId(action))
          spawnEntityAction.setSource(cloningEntity)
          @getGameSession().executeAction(spawnEntityAction)
          # make the clone 1 health
          spawnedClone = spawnEntityAction.getCard()
          set1Health = Modifier.createContextObjectWithRebasedAttributeBuffs(0, 1, false, true)
          set1Health.appliedName = "Imperfect Clone"
          set1Health.appliedDescription = "1 Health"
          @getGameSession().applyModifierContextObject(set1Health, spawnedClone)


  getCardDataOrIndexToSpawn: () ->
    return @cardDataOrIndexToSpawn

  getEntityToSpawn: (x, y) ->
    return @getGameSession().getBoard().getUnitAtPosition({x: x, y: y})

  getSpawnOwnerId: (action) ->
    return @getCard().getOwnerId()

  getIsCardRelevantToWatcher: (card) ->
    return true #default when no card restrictions are needed

module.exports = ModifierOpponentSummonWatchSpawn1HealthClone
