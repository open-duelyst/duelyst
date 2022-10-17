Modifier = require './modifier'
ReplaceCardFromHandAction = require 'app/sdk/actions/replaceCardFromHandAction'
i18next = require 'i18next'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierDamageBothGeneralsOnReplace extends Modifier

  type:"ModifierDamageBothGeneralsOnReplace"
  @type:"ModifierDamageBothGeneralsOnReplace"

  activeInHand: true
  activeInDeck: true
  activeInSignatureCards: false
  activeOnBoard: false

  fxResource: ["FX.Modifiers.ModifierBuffSelfOnReplace"]

  @createContextObject: (damageAmount=3, options=undefined) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  onAction: (e) ->
    super(e)

    action = e.action

    # watch for my player replacing THIS card
    if action instanceof ReplaceCardFromHandAction and action.getOwnerId() is @getCard().getOwnerId()
      replacedCard = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(action.replacedCardIndex)
      if replacedCard is @getCard()
        opponentGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
        myGeneral = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

        damageAction = @getCard().getGameSession().createActionForType(DamageAction.type)
        damageAction.setSource(@getCard())
        damageAction.setTarget(opponentGeneral)
        damageAction.setDamageAmount(@damageAmount)
        @getCard().getGameSession().executeAction(damageAction)

        damageAction2 = @getCard().getGameSession().createActionForType(DamageAction.type)
        damageAction2.setSource(@getCard())
        damageAction2.setTarget(myGeneral)
        damageAction2.setDamageAmount(@damageAmount)
        @getCard().getGameSession().executeAction(damageAction2)

module.exports = ModifierDamageBothGeneralsOnReplace
