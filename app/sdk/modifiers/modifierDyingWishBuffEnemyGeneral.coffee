ModifierDyingWish = require './modifierDyingWish'
Modifier = require './modifier'
i18next = require 'i18next'

class ModifierDyingWishBuffEnemyGeneral extends ModifierDyingWish

  type:"ModifierDyingWishBuffEnemyGeneral"
  @type:"ModifierDyingWishBuffEnemyGeneral"

  name:"ModifierDyingWishBuffEnemyGeneral"
  description: "When this minion dies, buff the enemy general"

  @appliedName: "Agonizing Death"
  @appliedDescription: ""

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericDamage"]

  @createContextObject: (atkBuff=2, healthBuff=10, options) ->
    contextObject = super(options)
    contextObject.atkBuff = atkBuff
    contextObject.healthBuff = healthBuff
    return contextObject

  onDyingWish: () ->
    enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    if enemyGeneral?
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(@atkBuff,@healthBuff)
      statContextObject.appliedName = i18next.t("modifiers.boss_36_applied_name")
      @getGameSession().applyModifierContextObject(statContextObject, enemyGeneral)

module.exports = ModifierDyingWishBuffEnemyGeneral
