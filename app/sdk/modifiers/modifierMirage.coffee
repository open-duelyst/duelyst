Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'
RemoveAction = require 'app/sdk/actions/removeAction'
i18next = require 'i18next'

class ModifierMirage extends Modifier

  type:"ModifierMirage"
  @type:"ModifierMirage"

  @modifierName:i18next.t("modifiers.mirage_name")
  @description:i18next.t("modifiers.mirage_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true
  isRemovable: false

  fxResource: ["FX.Modifiers.ModifierMirage"]

  onBeforeAction: (event) ->
    super(event)
    action = event.action

    # supress strikeback on this minion since it must vanish immediately when attacked
    if action instanceof AttackAction and action.getTarget() == @getCard() and action.getIsStrikebackAllowed()
      action.setIsStrikebackAllowed(false)

    # when attacked, remove self immediately
    if action instanceof AttackAction and action.getTarget() == @getCard() and !action.getIsImplicit()
      thisEntity = @getCard()
      if @getCard()?.getIsActive()
        removeOriginalEntityAction = new RemoveAction(@getGameSession())
        removeOriginalEntityAction.setOwnerId(thisEntity.getOwnerId())
        removeOriginalEntityAction.setTarget(thisEntity)
        removeOriginalEntityAction.setIsDepthFirst(true)
        @getGameSession().executeAction(removeOriginalEntityAction)


module.exports = ModifierMirage
