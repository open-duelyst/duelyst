Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierAttacksDamageAllEnemyMinions extends Modifier

  type:"ModifierAttacksDamageAllEnemyMinions"
  @type:"ModifierAttacksDamageAllEnemyMinions"

  @modifierName:"Attacks Damage All Enemy Minions"
  @description:"Attacks damage all enemy minions"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  onBeforeAction: (actionEvent) ->
    super(actionEvent)

    a = actionEvent.action
    if a instanceof AttackAction and a.getSource() == @getCard()

      entities = @getGameSession().getBoard().getFriendlyEntitiesForEntity(a.getTarget())
      for entity in entities
        if !entity.getIsGeneral() # do not target the general
          damageAction = new DamageAction(@getGameSession())
          damageAction.setOwnerId(@getCard().getOwnerId())
          damageAction.setSource(@getCard())
          damageAction.setTarget(entity)
          damageAction.setDamageAmount(@getCard().getATK())
          @getGameSession().executeAction(damageAction)

module.exports = ModifierAttacksDamageAllEnemyMinions
