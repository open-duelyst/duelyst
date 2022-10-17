ModifierSituationalBuffSelf = require './modifierSituationalBuffSelf'
Races = require 'app/sdk/cards/racesLookup'
CardType = require 'app/sdk/cards/cardType'

class ModifierSituationalBuffSelfIfHaveMech extends ModifierSituationalBuffSelf

  type:"ModifierSituationalBuffSelfIfHaveMech"
  @type:"ModifierSituationalBuffSelfIfHaveMech"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  @createContextObject: (modifierContextObjects, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifierContextObjects
    return contextObject

  getIsSituationActiveForCache: () ->

    friendlyMinions = @getGameSession().getBoard().getFriendlyEntitiesForEntity(@getCard(), CardType.Unit, true, false)
    if friendlyMinions?
      for minion in friendlyMinions
        if minion? and minion.getBelongsToTribe(Races.Mech)
          return true
    return false

module.exports = ModifierSituationalBuffSelfIfHaveMech
