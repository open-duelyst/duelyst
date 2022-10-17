ModifierCannot = require './modifierCannot'
RemoveCardFromHandAction = require 'app/sdk/actions/removeCardFromHandAction'
i18next = require 'i18next'

class ModifierCannotBeRemovedFromHand extends ModifierCannot

  type: "ModifierCannotBeRemovedFromHand"
  @type: "ModifierCannotBeRemovedFromHand"

  activeInHand: true

  onValidateAction:(actionEvent) ->
    a = actionEvent.action

    if a instanceof RemoveCardFromHandAction and a.getIsValid() and @getCard().getIsLocatedInHand()
      if @getCard().getOwner().getDeck().getCardInHandAtIndex(a.indexOfCardInHand)?.getIndex() is @getCard().getIndex()
        @invalidateAction(a, @getCard().getPosition())

module.exports = ModifierCannotBeRemovedFromHand
