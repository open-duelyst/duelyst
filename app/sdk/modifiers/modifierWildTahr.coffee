ModifierEnemyAttackWatch = require './modifierEnemyAttackWatch'
Modifier = require './modifier'
i18next = require 'i18next'

class  ModifierWildTahr extends ModifierEnemyAttackWatch

  type:"ModifierWildTahr"
  @type:"ModifierWildTahr"

  @modifierName:"ModifierWildTahr"
  @description:i18next.t("modifiers.wild_tahr_def")

  onEnemyAttackWatch: (action) ->

    statContextObject = Modifier.createContextObjectWithAttributeBuffs(3)
    statContextObject.appliedName = i18next.t("modifiers.wild_tahr_name")
    statContextObject.durationEndTurn = 2
    @getGameSession().applyModifierContextObject(statContextObject, @getCard())

module.exports = ModifierWildTahr
