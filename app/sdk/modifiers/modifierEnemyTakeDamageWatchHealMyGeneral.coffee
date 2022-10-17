ModifierEnemyTakeDamageWatch = require './modifierEnemyTakeDamageWatch'
HealAction = require 'app/sdk/actions/healAction'

class ModifierEnemyTakeDamageWatchHealMyGeneral extends ModifierEnemyTakeDamageWatch

  type:"ModifierEnemyTakeDamageWatchHealMyGeneral"
  @type:"ModifierEnemyTakeDamageWatchHealMyGeneral"

  @modifierName:"Enemy Take Damage Watch Heal My General"
  @description:"Whenever an enemy minion or General takes damage, restore %X Health to your General"

  fxResource: ["FX.Modifiers.ModifierEnemyTakeDamageWatchHealMyGeneral"]

  @createContextObject: (healAmount=0, options) ->
    contextObject = super(options)
    contextObject.healAmount = healAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.healAmount
    else
      return @description

  onEnemyDamageTaken: (action) ->
    myGeneral = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if myGeneral?
      healAction = new HealAction(@getGameSession())
      healAction.setOwnerId(@getCard().getOwnerId())
      healAction.setTarget(myGeneral)
      healAction.setHealAmount(@healAmount)
      @getGameSession().executeAction(healAction)

module.exports = ModifierEnemyTakeDamageWatchHealMyGeneral
