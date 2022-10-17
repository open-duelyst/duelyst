Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
DieAction = require 'app/sdk/actions/dieAction'

class ModifierKillWatch extends Modifier

  type:"ModifierKillWatch"
  @type:"ModifierKillWatch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierKillWatch"]

  includeAllies: true
  includeGenerals: true

  @createContextObject: (includeAllies=true, includeGenerals=true, options) ->
    contextObject = super(options)
    contextObject.includeAllies = includeAllies
    contextObject.includeGenerals = includeGenerals
    return contextObject

  onAction: (e) ->
    super(e)

    action = e.action

    # when we kill any unit or general
    if @getIsActionRelevant(action)
      @onKillWatch(action)

  getIsActionRelevant: (action) ->
    if action instanceof DieAction and action.getTarget() != @getCard() and action.getTarget()?.type is CardType.Unit and action.getSource() is @getCard()
      if @includeAllies or action.getTarget().getOwnerId() != @getCard().getOwnerId()
        if @includeGenerals or !action.getTarget().getIsGeneral()
          return true
    return false

  onKillWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierKillWatch
