ModifierEndTurnWatch = require './modifierEndTurnWatch'
CardType = require 'app/sdk/cards/cardType'
HealAction = require 'app/sdk/actions/healAction'

class ModifierEndTurnWatchApplyModifiers extends ModifierEndTurnWatch

  type:"ModifierEndTurnWatchApplyModifiers"
  @type:"ModifierEndTurnWatchApplyModifiers"

  @modifierName:"End Watch"
  @description:"At the end of your turn, %X"

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, auraIncludeSelf, auraIncludeAlly, auraIncludeEnemy, auraRadius, canTargetGeneral, description, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.auraIncludeAlly = auraIncludeAlly
    contextObject.auraIncludeEnemy = auraIncludeEnemy
    contextObject.auraIncludeSelf = auraIncludeSelf
    contextObject.auraRadius = auraRadius
    contextObject.canTargetGeneral = canTargetGeneral
    contextObject.description = description
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.description
    else
      return @description

  onTurnWatch: (action) ->
    if @modifiersContextObjects?
      for entity in @getAffectedEntities()
        for modifierContextObject in @modifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, entity)

  getAffectedEntities: (action) ->
    entityList = @getGameSession().getBoard().getCardsWithinRadiusOfPosition(@getCard().getPosition(), @auraFilterByCardType, @auraRadius, @auraIncludeSelf)
    affectedEntities = []
    for entity in entityList
      if (@auraIncludeAlly and entity.getIsSameTeamAs(@getCard())) or (@auraIncludeEnemy and !entity.getIsSameTeamAs(@getCard()))
        if @canTargetGeneral or !entity.getIsGeneral()
          affectedEntities.push(entity)
    return affectedEntities

module.exports = ModifierEndTurnWatchApplyModifiers
