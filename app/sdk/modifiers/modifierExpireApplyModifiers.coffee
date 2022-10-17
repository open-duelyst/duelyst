Modifier = require './modifier'

class ModifierExpireApplyModifiers extends Modifier

  type:"ModifierExpireApplyModifiers"
  @type:"ModifierExpireApplyModifiers"

  @modifierName: ""
  @description: ""

  modifiersContextObjects: null

  @createContextObject: (modifiersContextObjects, durationEndTurn=1, durationStartTurn=0, auraIncludeSelf, auraIncludeAlly, auraIncludeEnemy, auraRadius, canTargetGeneral, description, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.durationEndTurn = durationEndTurn
    contextObject.durationStartTurn = durationStartTurn
    contextObject.auraIncludeAlly = auraIncludeAlly
    contextObject.auraIncludeEnemy = auraIncludeEnemy
    contextObject.auraIncludeSelf = auraIncludeSelf
    contextObject.auraRadius = auraRadius
    contextObject.canTargetGeneral = canTargetGeneral
    contextObject.description = description
    return contextObject

  onExpire: () ->
    super()

    if @modifiersContextObjects?
      for entity in @getAffectedEntities()
        for modifierContextObject in @modifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, entity)

  getAffectedEntities: () ->
    entityList = @getGameSession().getBoard().getCardsWithinRadiusOfPosition(@getCard().getPosition(), @auraFilterByCardType, @auraRadius, @auraIncludeSelf)
    affectedEntities = []
    for entity in entityList
      if (@auraIncludeAlly and entity.getIsSameTeamAs(@getCard())) or (@auraIncludeEnemy and !entity.getIsSameTeamAs(@getCard()))
        if @canTargetGeneral or !entity.getIsGeneral()
          affectedEntities.push(entity)
    return affectedEntities

module.exports = ModifierExpireApplyModifiers
