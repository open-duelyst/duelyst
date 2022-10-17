UtilsGameSession = require 'app/common/utils/utils_game_session'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =  require './spellFilterType'
_ = require 'underscore'

class SpellApplyModifiersToUnitsInHand extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralIndirect
  applyToOwnPlayer: false
  applyToEnemyPlayer: false
  cardTypeToTarget: CardType.Unit # type of card to target
  raceIdToTarget: null # race of cards to target

  onApplyToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    for card in @getCardsAffected()
      for modifierContextObject in @targetModifiersContextObjects
        @getGameSession().applyModifierContextObject(modifierContextObject, card)

  getCardsAffected: () ->
    cardType = @cardTypeToTarget
    raceId = @raceIdToTarget
    cards = []

    if @applyToOwnPlayer
      deck = @getOwner().getDeck()
      cards = deck.getCardsInHand()

    if @applyToEnemyPlayer
      deck = @getGameSession().getOpponentPlayerOfPlayerId(@getOwnerId()).getDeck()
      cards = deck.getCardsInHand()

    return _.filter(cards, (card) -> return card? and (!cardType or card.getType() == cardType) and (!raceId or card.getBelongsToTribe(raceId)))

module.exports = SpellApplyModifiersToUnitsInHand
