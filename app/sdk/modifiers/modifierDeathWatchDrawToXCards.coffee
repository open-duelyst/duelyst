Modifier = require './modifier'
ModifierDeathWatch = require './modifierDeathWatch'
DrawToXCardsAction = require 'app/sdk/actions/drawToXCardsAction'

class ModifierDeathWatchDrawToXCards extends ModifierDeathWatch

  type:"ModifierDeathWatchDrawToXCards"
  @type:"ModifierDeathWatchDrawToXCards"

  @modifierName:"Deathwatch"
  @description: "Draw until you have %X cards"

  fxResource: ["FX.Modifiers.ModifierDeathwatch"]

  @createContextObject: (cardCount=0,options) ->
    contextObject = super(options)
    contextObject.cardCount = cardCount
    contextObject.triggeredOnActionIndices = []
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.cardCount
    else
      return @description

  onDeathWatch: (action) ->
    # only trigger once per root action
    # since this is a deathwatch, many things can die at once
    # and we don't want to trigger multiple sets of card draws
    rootAction = action.getRootAction()
    if !(rootAction.getIndex() in @triggeredOnActionIndices)
      drawToXCardsAction = new DrawToXCardsAction(@getGameSession(), @getCard().getOwnerId())
      drawToXCardsAction.setCardCount(@cardCount)
      @getGameSession().executeAction(drawToXCardsAction)
      @triggeredOnActionIndices.push(rootAction.getIndex())

module.exports = ModifierDeathWatchDrawToXCards
