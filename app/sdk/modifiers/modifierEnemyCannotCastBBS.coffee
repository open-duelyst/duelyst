ModifierCannot = require './modifierCannot'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
PlaySignatureCardAction = require 'app/sdk/actions/playSignatureCardAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierEnemyCannotCastBBS extends ModifierCannot

  type: "ModifierEnemyCannotCastBBS"
  @type: "ModifierEnemyCannotCastBBS"


  manaCostPrevented: 0

  fxResource: ["FX.Modifiers.ModifierCannotCastSpellsByCost"]

  @createContextObject: () ->
    contextObject = super()
    return contextObject

  onValidateAction:(actionEvent) ->
    a = actionEvent.action

    # prevents owner from casting BBS
    if (a instanceof PlaySignatureCardAction and a.getOwner() isnt @getOwner()) and a.getIsValid() and !a.getIsImplicit() and a.getCard()?.getType() is CardType.Spell
      @invalidateAction(a, @getCard().getPosition(), "You can't cast that!")

module.exports = ModifierEnemyCannotCastBBS
