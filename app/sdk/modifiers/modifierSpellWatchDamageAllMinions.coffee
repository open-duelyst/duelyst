ModifierSpellWatch = require './modifierSpellWatch'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierSpellWatchDamageAllMinions extends ModifierSpellWatch

  type:"ModifierSpellWatchDamageAllMinions"
  @type:"ModifierSpellWatchDamageAllMinions"

  @modifierName:"Spell Watch (Damage All Minions)"
  @description:"Whenever you cast a spell, deal %X damage to ALL minions"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierSpellWatch", "FX.Modifiers.ModifierGenericChainLightning"]

  @createContextObject: (damageAmount,options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  onSpellWatch: (action) ->
    super(action)

    board = @getGameSession().getBoard()

    for unit in board.getUnits(true, false)
      if unit? and !unit.getIsGeneral()
        damageAction = new DamageAction(this.getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setDamageAmount(@damageAmount)
        damageAction.setTarget(unit)
        @getGameSession().executeAction(damageAction)

module.exports = ModifierSpellWatchDamageAllMinions
