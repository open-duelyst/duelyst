Modifier = require './modifier'
i18next = require 'i18next'

class ModifierAttackEqualsHealth extends Modifier

  type:"ModifierAttackEqualsHealth"
  @type:"ModifierAttackEqualsHealth"

  name:i18next.t("modifiers.attack_equals_health_name")
  description:i18next.t("modifiers.attack_equals_health_def")

  maxStacks: 1

  fxResource: ["FX.Modifiers.ModifierAttackEqualsHealth"]

  constructor: (gameSession) ->
    super(gameSession)
    @attributeBuffsAbsolute = ["atk"]
    @attributeBuffsFixed = ["atk"]

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.cachedHP = 0

    return p

  getBuffedAttribute: (attributeValue, buffKey) ->
    if buffKey == "atk"
      return @_private.cachedHP
    else
      return super(attributeValue, buffKey)

  getBuffsAttributes: () ->
    return true

  getBuffsAttribute: (buffKey) ->
    return buffKey == "atk" or super(buffKey)

  updateCachedStateAfterActive: () ->
    super()

    card = @getCard()
    if card?
      hp = Math.max(0, card.getHP())
    else
      hp = 0

    if @_private.cachedHP != hp
      @_private.cachedHP = hp
      @getCard().flushCachedAttribute("atk")

module.exports = ModifierAttackEqualsHealth
