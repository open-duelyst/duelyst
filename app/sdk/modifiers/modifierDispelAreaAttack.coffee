Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'
ModifierSilence = require './modifierSilence'
DamageAction = require 'app/sdk/actions/damageAction'

###
This is purposely not a subclass of myAttackWatch, because this dispel should occur
on beforeAction, rather than onAction
###

class ModifierDispelAreaAttack extends Modifier

  type:"ModifierDispelAreaAttack"
  @type:"ModifierDispelAreaAttack"

  @modifierName:"Magic Buster Cannon"
  @description:"Whenever this attacks or counterattacks, it damages and dispels the enemy and all enemies nearby that target"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  onBeforeAction: (actionEvent) ->
    super(actionEvent)
    # dispel target before attack action so that it cannot do onAttack actions
    # example: this dispel disables strikeback before it can counter attack
    a = actionEvent.action
    if a instanceof AttackAction and a.getSource() == @getCard()
      @getGameSession().applyModifierContextObject(ModifierSilence.createContextObject(), a.getTarget())

      #dispel and damage the area too
      entities = @getGameSession().getBoard().getFriendlyEntitiesAroundEntity(a.getTarget(), CardType.Unit, 1)
      for entity in entities
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@getCard().getATK())
        @getGameSession().executeAction(damageAction)
        @getGameSession().applyModifierContextObject(ModifierSilence.createContextObject(), entity)



module.exports = ModifierDispelAreaAttack
