ModifierIntensify = require './modifierIntensify'
Modifier = require './modifier'

class ModifierIntensifyBuffSelf extends ModifierIntensify

  type:"ModifierIntensifyBuffSelf"
  @type:"ModifierIntensifyBuffSelf"

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

    totalAttackBuff = @getIntensifyAmount() * @attackBuff
    totalHealthBuff = @getIntensifyAmount() * @healthBuff

    statContextObject = Modifier.createContextObjectWithAttributeBuffs(totalAttackBuff, totalHealthBuff)
    statContextObject.appliedName = @modifierName
    @getGameSession().applyModifierContextObject(statContextObject, @getCard())

module.exports = ModifierIntensifyBuffSelf