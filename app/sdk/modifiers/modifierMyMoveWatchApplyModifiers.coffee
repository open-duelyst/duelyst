Modifier = require './modifier'
ModifierMyMoveWatch = require './modifierMyMoveWatch'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'

class ModifierMyMoveWatchApplyModifiers extends ModifierMyMoveWatch

  type:"ModifierMyMoveWatchApplyModifiers"
  @type:"ModifierMyMoveWatchApplyModifiers"

  @description: ""

  fxResource: ["FX.Modifiers.ModifierMyMoveWatch", "FX.Modifiers.ModifierGenericBuff"]

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

  onMyMoveWatch: (action) ->
    if @modifiersContextObjects?
      for entity in @getAffectedEntities()
        for modifierContextObject in @modifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, entity)

  getAffectedEntities: (action) ->
    entityList = @getGameSession().getBoard().getCardsWithinRadiusOfPosition(@getCard().position, @auraFilterByCardType, @auraRadius, @auraIncludeSelf)
    affectedEntities = []
    for entity in entityList
      if (@auraIncludeAlly and entity.getIsSameTeamAs(@getCard())) or (@auraIncludeEnemy and !entity.getIsSameTeamAs(@getCard()))
        if @canTargetGeneral or !entity.getIsGeneral()
          affectedEntities.push(entity)
    return affectedEntities


module.exports = ModifierMyMoveWatchApplyModifiers
