ModifierOverwatchMovedNearby = require './modifierOverwatchMovedNearby'
HealAction = require 'app/sdk/actions/healAction'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierOverwatchMovedNearbyMiniImmolation extends ModifierOverwatchMovedNearby

  type:"ModifierOverwatchMovedNearbyMiniImmolation"
  @type:"ModifierOverwatchMovedNearbyMiniImmolation"

  @createContextObject: (damageAmount=0, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  onOverwatch: (action) ->
    # heal self
    healAction = new HealAction(@getGameSession())
    healAction.setOwnerId(@getCard().getOwnerId())
    healAction.setTarget(@getCard())
    healAction.setHealAmount(@getCard().getDamage()) # heal all damage on the unit
    @getGameSession().executeAction(healAction)

    #damage enemy units around this unit
    entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    for entity in entities
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(entity)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierOverwatchMovedNearbyMiniImmolation
