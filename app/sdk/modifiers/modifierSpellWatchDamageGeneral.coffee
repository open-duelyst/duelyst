CONFIG = require 'app/common/config'
ModifierSpellWatch = require './modifierSpellWatch'
CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierSpellWatchDamageGeneral extends ModifierSpellWatch

  type:"ModifierSpellWatchDamageGeneral"
  @type:"ModifierSpellWatchDamageGeneral"

  @modifierName:"Spell Watch (Damage General)"
  @description:"Whenever you cast a spell, deal %X damage to the enemy General"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierSpellWatch", "FX.Modifiers.ModifierGenericDamage"]

  @createContextObject: (damageAmount,options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onSpellWatch: (action) ->
    super(action)

    general = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())

    damageAction = new DamageAction(this.getGameSession())
    damageAction.setOwnerId(@getCard().getOwnerId())
    damageAction.setSource(@getCard())
    damageAction.setTarget(general)
    damageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(damageAction)

module.exports = ModifierSpellWatchDamageGeneral
