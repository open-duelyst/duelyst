ModifierOverwatchSpellTarget = require './modifierOverwatchSpellTarget'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierOverwatchSpellTargetDamageEnemies extends ModifierOverwatchSpellTarget

  type:"ModifierOverwatchSpellTargetDamageEnemies"
  @type:"ModifierOverwatchSpellTargetDamageEnemies"

  @createContextObject: (damageAmount=0, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  onOverwatch: (action) ->
    #damage enemy units around this unit
    for entity in @getGameSession().getBoard().getEnemyEntitiesForEntity(@getCard())
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(entity)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierOverwatchSpellTargetDamageEnemies
