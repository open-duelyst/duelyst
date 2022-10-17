ModifierCannot = require './modifierCannot'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
PlaySignatureCardAction = require 'app/sdk/actions/playSignatureCardAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierCannotCastSpellsByCost extends ModifierCannot

  type: "ModifierCannotCastSpellsByCost"
  @type: "ModifierCannotCastSpellsByCost"

  @modifierName: "Cannot Cast Spells"
  @description: "Players can't cast spells."

  manaCostPrevented: 0

  fxResource: ["FX.Modifiers.ModifierCannotCastSpellsByCost"]

  @createContextObject: (manaCostPrevented) ->
    contextObject = super()
    contextObject.manaCostPrevented = manaCostPrevented
    return contextObject

  onValidateAction:(actionEvent) ->
    a = actionEvent.action

    # minion prevents players from casting spells at certain mana costs
    if ((a instanceof PlayCardFromHandAction) or (a instanceof PlaySignatureCardAction)) and a.getIsValid() and !a.getIsImplicit() and a.getCard()?.getType() is CardType.Spell and a.getManaCost() <= @manaCostPrevented
      @invalidateAction(a, @getCard().getPosition(), "You can't cast that!")

module.exports = ModifierCannotCastSpellsByCost
