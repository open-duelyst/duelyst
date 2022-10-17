Modifier = require './modifier'
ModifierHealWatch = require './modifierHealWatch'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

i18next = require('i18next')

class ModifierHealWatchBuffSelf extends ModifierHealWatch

  type:"ModifierHealWatchBuffSelf"
  @type:"ModifierHealWatchBuffSelf"

  fxResource: ["FX.Modifiers.ModifierHealWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (attackBuff=0, maxHPBuff=0,options) ->
    contextObject = super(options)
    statsBuff = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    statsBuff.appliedName = i18next.t("modifiers.healwatch_bufself_applied_name")
    contextObject.modifiersContextObjects = [statsBuff]
    return contextObject

  onHealWatch: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierHealWatchBuffSelf
