Modifier = require './modifier'
ModifierOpeningGambit = require './modifierOpeningGambit'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

###
 Modifier is used to apply modifiers to cards in deck and hand when a card is played to the board.
###
class ModifierOpeningGambitApplyModifiersToDeck extends ModifierOpeningGambit

  type:"ModifierOpeningGambitApplyModifiersToDeck"
  @type:"ModifierOpeningGambitApplyModifiersToDeck"

  @description: ""

  modifiersContextObjects: null # modifier context objects for modifiers to apply
  managedByCard: false # whether card with opening gambit should manage the modifiers applied, i.e. when the card is silenced/killed these modifiers are removed
  applyToOwnPlayer: false
  applyToEnemyPlayer: false
  cardType: CardType.Unit # type of card to target
  raceId: null # race of cards to target

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, managedByCard=false, applyToOwnPlayer=false, applyToEnemyPlayer=false, cardType=CardType.Unit, raceId=null, description, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.managedByCard = managedByCard
    contextObject.applyToOwnPlayer = applyToOwnPlayer
    contextObject.applyToEnemyPlayer = applyToEnemyPlayer
    contextObject.cardType = cardType
    contextObject.raceId = raceId
    contextObject.description = description
    return contextObject

  @createContextObjectToTargetOwnPlayer: (modifiersContextObjects, managedByCard, cardType, raceId, description, options) ->
    return @createContextObject(modifiersContextObjects, managedByCard, true, false, cardType, raceId, description, options)

  @createContextObjectToTargetEnemyPlayer: (modifiersContextObjects, managedByCard, cardType, raceId, description, options) ->
    return @createContextObject(modifiersContextObjects, managedByCard, false, true, cardType, raceId, description, options)

  onOpeningGambit: () ->
    if @modifiersContextObjects?
      for card in @getCardsAffected()
        for modifierContextObject in @modifiersContextObjects
          if @managedByCard
            @getGameSession().applyModifierContextObject(modifierContextObject, card, @)
          else
            @getGameSession().applyModifierContextObject(modifierContextObject, card)

  getCardsAffected: () ->
    cardType = @cardType
    raceId = @raceId
    cards = []

    if @applyToOwnPlayer
      deck = @getCard().getOwner().getDeck()
      cards = cards.concat(deck.getCardsInHand(), deck.getCardsInDrawPile())

    if @applyToEnemyPlayer
      deck = @getGameSession().getOpponentPlayerOfPlayerId(@getCard().getOwnerId()).getDeck()
      cards = cards.concat(deck.getCardsInHand(), deck.getCardsInDrawPile())

    return _.filter(cards, (card) -> return card? and (!cardType or card.getType() == cardType) and (!raceId or card.getBelongsToTribe(raceId)))

module.exports = ModifierOpeningGambitApplyModifiersToDeck
