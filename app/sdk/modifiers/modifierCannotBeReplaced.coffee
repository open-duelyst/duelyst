ModifierCannot = require './modifierCannot'
ReplaceCardFromHandAction = require 'app/sdk/actions/replaceCardFromHandAction'
i18next = require 'i18next'

class ModifierCannotBeReplaced extends ModifierCannot

  type: "ModifierCannotBeReplaced"
  @type: "ModifierCannotBeReplaced"

  activeInHand: true

  @modifierName:i18next.t("modifiers.bound_name")
  @description:i18next.t("modifiers.bound_desc")

  fxResource: ["FX.Modifiers.ModifierCannotBeReplaced"]

  onValidateAction:(actionEvent) ->
    a = actionEvent.action

    if a instanceof ReplaceCardFromHandAction and a.getIsValid() and @getCard().getIsLocatedInHand() and a.getOwner() is @getCard().getOwner()
      if @getCard().getOwner().getDeck().getCardInHandAtIndex(a.indexOfCardInHand)?.getIndex() is @getCard().getIndex()
        @invalidateAction(a, @getCard().getPosition(), i18next.t("modifiers.cannot_replace_error"))

module.exports = ModifierCannotBeReplaced
