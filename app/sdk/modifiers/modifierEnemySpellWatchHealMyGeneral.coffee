ModifierEnemySpellWatch = require './modifierEnemySpellWatch'
HealAction = require 'app/sdk/actions/healAction'

class ModifierEnemySpellWatchHealMyGeneral extends ModifierEnemySpellWatch

  type:"ModifierEnemySpellWatchHealMyGeneral"
  @type:"ModifierEnemySpellWatchHealMyGeneral"

  fxResource: ["FX.Modifiers.ModifierSpellWatch", "FX.Modifiers.ModifierGenericHeal"]

  healAmount: 0

  @createContextObject: (healAmount, options) ->
    contextObject = super(options)
    contextObject.healAmount = healAmount
    return contextObject

  onEnemySpellWatch: (action) ->
    myGeneral = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if myGeneral?
      healAction = new HealAction(@getGameSession())
      healAction.setOwnerId(@getCard().getOwnerId())
      healAction.setTarget(myGeneral)
      healAction.setHealAmount(@healAmount)
      @getGameSession().executeAction(healAction)

module.exports = ModifierEnemySpellWatchHealMyGeneral
