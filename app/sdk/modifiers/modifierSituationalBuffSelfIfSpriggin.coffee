ModifierSituationalBuffSelf = require './modifierSituationalBuffSelf'
Modifier = require './modifier'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierSituationalBuffSelfIfSpriggin extends ModifierSituationalBuffSelf

  type:"ModifierSituationalBuffSelfIfSpriggin"
  @type:"ModifierSituationalBuffSelfIfSpriggin"

  @modifierName:"ModifierSituationalBuffSelfIfSpriggin"
  @description:"If there is a Spriggin gain +3 Attack"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  @createContextObject: (options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = [
      Modifier.createContextObjectWithAttributeBuffs(3,0,{
        modifierName:"Spriggin Buff",
        appliedName:"Might of Spriggin",
        description:"If there is a Spriggin gain +3 Attack"
      })
    ]
    return contextObject

  getIsSituationActiveForCache: () ->
    for unit in @getGameSession().getBoard().getUnits()
      if unit?.getBaseCardId() is Cards.Neutral.Spriggin
        return true
    return false

module.exports = ModifierSituationalBuffSelfIfSpriggin
