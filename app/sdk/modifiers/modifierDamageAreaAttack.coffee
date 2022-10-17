Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'
i18next = require 'i18next'

class ModifierDamageAreaAttack extends Modifier

  type:"ModifierDamageAreaAttack"
  @type:"ModifierDamageAreaAttack"

  onBeforeAction: (actionEvent) ->
    super(actionEvent)

    a = actionEvent.action
    if a instanceof AttackAction and a.getSource() == @getCard()

      #damage the area too
      entities = @getGameSession().getBoard().getFriendlyEntitiesAroundEntity(a.getTarget(), CardType.Unit, 1)
      for entity in entities
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@getCard().getATK())
        @getGameSession().executeAction(damageAction)


module.exports = ModifierDamageAreaAttack
