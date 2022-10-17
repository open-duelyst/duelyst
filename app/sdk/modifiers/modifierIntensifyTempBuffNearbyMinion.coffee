ModifierIntensify = require './modifierIntensify'
Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'

class ModifierIntensifyTempBuffNearbyMinion extends ModifierIntensify

  type:"ModifierIntensifyTempBuffNearbyMinion"
  @type:"ModifierIntensifyTempBuffNearbyMinion"

  attackBuff: 0
  healthBuff: 0
  modifierName: null

  @createContextObject: (attackBuff, healthBuff, modifierName, options) ->
    contextObject = super(options)
    contextObject.attackBuff = attackBuff
    contextObject.healthBuff = healthBuff
    contextObject.modifierName = modifierName
    return contextObject

  onIntensify: () ->

    if @getGameSession().getIsRunningAsAuthoritative()
      totalAttackBuff = @getIntensifyAmount() * @attackBuff
      totalHealthBuff = @getIntensifyAmount() * @healthBuff
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(totalAttackBuff, totalHealthBuff)
      statContextObject.appliedName = @modifierName
      statContextObject.durationEndTurn = 1

      entities = @getGameSession().getBoard().getFriendlyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
      nearbyMinions = []
      for entity in entities
        if entity? and !entity.getIsGeneral()
          nearbyMinions.push(entity)

      if nearbyMinions.length > 0
        minionToBuff = nearbyMinions[@getGameSession().getRandomIntegerForExecution(nearbyMinions.length)]
        @getGameSession().applyModifierContextObject(statContextObject, minionToBuff)

module.exports = ModifierIntensifyTempBuffNearbyMinion