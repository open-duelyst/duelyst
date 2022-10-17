ModifierOpeningGambit = require './modifierOpeningGambit'
Stringifiers = require 'app/sdk/helpers/stringifiers'
Modifier = require './modifier'

class ModifierOpeningGambitBuffSelfByOpponentHandCount extends ModifierOpeningGambit

  type: "ModifierOpeningGambitBuffSelfByOpponentHandCount"
  @type: "ModifierOpeningGambitBuffSelfByOpponentHandCount"

  @description: "Gains %X for each card in your opponent\'s action bar"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericBuff"]

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.numCardsInHand = 0

    return p

  @createContextObject: (attackBuff = 0, maxHPBuff = 0, options = undefined) ->
    contextObject = super(options)
    buffContextObject = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    buffContextObject.appliedName = "Power of The Hand"
    contextObject.modifiersContextObjects = [buffContextObject]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
    else
      return @description

  applyManagedModifiersFromModifiersContextObjects: (modifiersContextObjects, card) ->
    # apply once per card in opponent's hand
    for i in [0...@_private.numCardsInHand]
      super(modifiersContextObjects, card)

  onOpeningGambit: () ->
    super()

    @_private.numCardsInHand = @getCard().getGameSession().getOpponentPlayerOfPlayerId(@getCard().getOwnerId()).getDeck().getNumCardsInHand()
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierOpeningGambitBuffSelfByOpponentHandCount
