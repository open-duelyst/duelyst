CONFIG = require 'app/common/config'
ModifierSpellWatch = require './modifierSpellWatch'
CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'
HealAction = require 'app/sdk/actions/healAction'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierSpellWatchBloodLeech extends ModifierSpellWatch

  type:"ModifierSpellWatchBloodLeech"
  @type:"ModifierSpellWatchBloodLeech"

  damageAmount: 0
  healAmount: 0

  fxResource: ["FX.Modifiers.ModifierSpellWatch", "FX.Modifiers.ModifierGenericChain"]

  @createContextObject: (damageAmount, healAmount,options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    contextObject.healAmount = healAmount
    return contextObject

  onSpellWatch: (action) ->
    super(action)

    enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    myGeneral = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

    #damage enemy general
    damageAction = new DamageAction(this.getGameSession())
    damageAction.setOwnerId(@getCard().getOwnerId())
    damageAction.setSource(@getCard())
    damageAction.setTarget(enemyGeneral)
    damageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(damageAction)

    #heal my general
    healAction = new HealAction(this.getGameSession())
    healAction.setOwnerId(@getCard().getOwnerId())
    healAction.setSource(@getCard())
    healAction.setTarget(myGeneral)
    healAction.setHealAmount(@healAmount)
    @getCard().getGameSession().executeAction(healAction)

module.exports = ModifierSpellWatchBloodLeech
