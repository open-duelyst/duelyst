ModifierEnemyStunWatch = require './modifierEnemyStunWatch'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
ModifierTransformed = require 'app/sdk/modifiers/modifierTransformed'
HealAction = require 'app/sdk/actions/healAction'

class ModifierEnemyStunWatchFullyHeal extends ModifierEnemyStunWatch

  type:"ModifierEnemyStunWatchFullyHeal"
  @type:"ModifierEnemyStunWatchFullyHeal"

  cardDataOrIndexToSpawn: null

  fxResource: ["FX.Modifiers.ModifierSummonWatch"]

  @createContextObject: (options) ->
    contextObject = super(options)
    return contextObject

  onEnemyStunWatch: (action) ->
    super(action)

    if @getCard().getHP() < @getCard().getMaxHP()
      healAction = @getCard().getGameSession().createActionForType(HealAction.type)
      healAction.setTarget(@getCard())
      healAction.setHealAmount(@getCard().getMaxHP() - @getCard().getHP())
      @getCard().getGameSession().executeAction(healAction)

module.exports = ModifierEnemyStunWatchFullyHeal
