Spell = require './spell'
CONFIG = require 'app/common/config'
CardType = require 'app/sdk/cards/cardType'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
RemoveAction = require 'app/sdk/actions/removeAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'
GameFormat = require 'app/sdk/gameFormat'
ModifierTransformed = require 'app/sdk/modifiers/modifierTransformed'
_ = require 'underscore'

class SpellTransformSameManaCost extends Spell

  cardDataOrIndexToSpawn: {id: Cards.Faction5.Egg} #random thing

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    targetUnit = board.getCardAtPosition({x:x, y:y}, @targetType)
    targetManaCost = targetUnit.getManaCost()
    targetOwnerId = targetUnit.getOwnerId()
    targetPosition = targetUnit.getPosition()

    if targetUnit?
      # find valid minions
      cardCache = []
      if @getGameSession().getGameFormat() is GameFormat.Standard
        cardCache = @getGameSession().getCardCaches().getIsLegacy(false).getIsHiddenInCollection(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getType(CardType.Unit).getCards()
      else
        cardCache = @getGameSession().getCardCaches().getIsHiddenInCollection(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getType(CardType.Unit).getCards()
      cards = []
      for card in cardCache
        if card.getManaCost() == targetManaCost and card.getBaseCardId() != targetUnit.getBaseCardId()
          cards.push(card)

      if cards?.length > 0
        # filter mythron cards
        cards = _.reject(cards, (card) ->
          return card.getRarityId() == 6
        )

      if cards.length > 0
        # remove original entity
        removeOriginalEntityAction = new RemoveAction(@getGameSession())
        removeOriginalEntityAction.setOwnerId(@getOwnerId())
        removeOriginalEntityAction.setTarget(targetUnit)
        @getGameSession().executeAction(removeOriginalEntityAction)

        # pick randomly from among the units we found with right mana cost
        card = cards[@getGameSession().getRandomIntegerForExecution(cards.length)]
        @cardDataOrIndexToSpawn = card.createNewCardData()
        @cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects ?= []
        @cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(ModifierTransformed.createContextObject(targetUnit.getExhausted(), targetUnit.getMovesMade(), targetUnit.getAttacksMade()))

        spawnEntityAction = new PlayCardAsTransformAction(@getGameSession(), targetOwnerId, targetPosition.x, targetPosition.y, @cardDataOrIndexToSpawn)
        @getGameSession().executeAction(spawnEntityAction)

module.exports = SpellTransformSameManaCost
