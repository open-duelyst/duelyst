Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'
ModifierSilence = require './modifierSilence'
DamageAction = require 'app/sdk/actions/damageAction'
i18next = require 'i18next'

###
This is purposely not a subclass of myAttackWatch, because this dispel should occur
on beforeAction, rather than onAction
###

class ModifierSelfDamageAreaAttack extends Modifier

  type:"ModifierSelfDamageAreaAttack"
  @type:"ModifierSelfDamageAreaAttack"

  @modifierName:i18next.t("modifiers.self_damage_area_attack_name")
  @description:i18next.t("modifiers.self_damage_area_attack_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  onBeforeAction: (actionEvent) ->
    super(actionEvent)

    a = actionEvent.action
    if a instanceof AttackAction and a.getSource() == @getCard()
      selfDamage = @getCard().getATK()

      #damage the area too
      entities = @getGameSession().getBoard().getFriendlyEntitiesAroundEntity(a.getTarget(), CardType.Unit, 1)
      for entity in entities
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@getCard().getATK())
        @getGameSession().executeAction(damageAction)
        selfDamage = selfDamage + @getCard().getATK()

      #then damage self a proportional amount
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(@getCard())
      damageAction.setDamageAmount(selfDamage)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierSelfDamageAreaAttack
