ModifierOpeningGambit = require './modifierOpeningGambit'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierOpeningGambitAlabasterTitan extends ModifierOpeningGambit

  type:"ModifierOpeningGambitAlabasterTitan"
  @type:"ModifierOpeningGambitAlabasterTitan"

  @description:"If you have no spells in your deck, equip a full set of armor"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: (action) ->

    gameSession = @getGameSession()

    hasSpells = false

    drawPile = @getCard().getOwner().getDeck().getDrawPile()
    for cardIndex, i in drawPile
      if gameSession.getCardByIndex(cardIndex)?.getType() == CardType.Spell
        hasSpells = true
        break
    
    if !hasSpells
      artifact1 = {id: Cards.Artifact.ArclyteRegalia}
      artifact2 = {id: Cards.Artifact.IndomitableWill}
      artifact3 = {id: Cards.Artifact.HaloBulwark}

      playCardAction1 = new PlayCardSilentlyAction(gameSession, @getCard().getOwnerId(), @getCard().getPosition().x, @getCard().getPosition().y, artifact1)
      playCardAction2 = new PlayCardSilentlyAction(gameSession, @getCard().getOwnerId(), @getCard().getPosition().x, @getCard().getPosition().y, artifact2)
      playCardAction3 = new PlayCardSilentlyAction(gameSession, @getCard().getOwnerId(), @getCard().getPosition().x, @getCard().getPosition().y, artifact3)

      playCardAction1.setSource(@getCard())
      playCardAction2.setSource(@getCard())
      playCardAction3.setSource(@getCard())

      gameSession.executeAction(playCardAction1)
      gameSession.executeAction(playCardAction2)
      gameSession.executeAction(playCardAction3)

module.exports = ModifierOpeningGambitAlabasterTitan
