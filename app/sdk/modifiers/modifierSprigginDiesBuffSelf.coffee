Modifier = require './modifier'
Cards = require 'app/sdk/cards/cardsLookupComplete'
DieAction = require 'app/sdk/actions/dieAction'
CardType = require 'app/sdk/cards/cardType'
i18next = require 'i18next'

class ModifierSprigginDiesBuffSelf extends Modifier

  type:"ModifierSprigginDiesBuffSelf"
  @type:"ModifierSprigginDiesBuffSelf"

  @description: "Whenever a Spriggin dies, give this +3/+3"

  fxResource: ["FX.Modifiers.ModifierGenericBuff"]

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  @createContextObject: (options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = [
      Modifier.createContextObjectWithAttributeBuffs(3,3,{
        modifierName:"Spriggin Dies Buff Self",
        appliedName:i18next.t("modifiers.spriggin_dies_buff_self_name")
        description:i18next.t("modifiers.spriggin_dies_buff_self_def")
      })
    ]
    return contextObject

  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action
    target = action.getTarget()
    entity = @getCard()
    # watch for a unit dying
    if action instanceof DieAction and target?.type is CardType.Unit and target != entity
      if target.getBaseCardId() is Cards.Neutral.Spriggin
        @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierSprigginDiesBuffSelf
