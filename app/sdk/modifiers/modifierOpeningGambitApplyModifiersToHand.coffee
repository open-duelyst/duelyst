Modifier = require './modifier'
ModifierOpeningGambitApplyModifiersToDeckAndHand = require './modifierOpeningGambitApplyModifiersToDeckAndHand'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

###
 Modifier is used to apply modifiers to cards ONLY IN HAND when a card is played to the board.
###
class ModifierOpeningGambitApplyModifiersToHand extends ModifierOpeningGambitApplyModifiersToDeckAndHand

  type:"ModifierOpeningGambitApplyModifiersToHand"
  @type:"ModifierOpeningGambitApplyModifiersToHand"

  getCardsAffected: () ->
    cardType = @cardType
    raceId = @raceId
    cards = []

    if @applyToOwnPlayer
      deck = @getCard().getOwner().getDeck()
      cards = cards.concat(deck.getCardsInHand())

    if @applyToEnemyPlayer
      deck = @getGameSession().getOpponentPlayerOfPlayerId(@getCard().getOwnerId()).getDeck()
      cards = cards.concat(deck.getCardsInHand())

    return _.filter(cards, (card) -> return card? and (!cardType or card.getType() == cardType) and (!raceId or card.getBelongsToTribe(raceId)))

module.exports = ModifierOpeningGambitApplyModifiersToHand
