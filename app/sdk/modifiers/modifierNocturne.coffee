Modifier = require './modifier'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierNocturne extends Modifier

  type:"ModifierNocturne"
  @type:"ModifierNocturne"

  @modifierName:"ModifierNocturne"
  @description: "Whenever you make Shadow Creep or a Wraithling, instead make both"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierSummonWatch"]

  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action


    if action instanceof ApplyCardToBoardAction and action.getOwnerId() is @getCard().getOwnerId()
      # if summoning a wraithling
      if action.getCard().getBaseCardId() is Cards.Faction4.Wraithling
        # also spawn a shadow creep
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), action.getTargetPosition().x, action.getTargetPosition().y, {id: Cards.Tile.Shadow})
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)
      # if summoning a shadow creep tile
      else if action.getCard().getBaseCardId() is Cards.Tile.Shadow
        # also spawn a wraithling
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), action.getTargetPosition().x, action.getTargetPosition().y, {id: Cards.Faction4.Wraithling})
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)


module.exports = ModifierNocturne
