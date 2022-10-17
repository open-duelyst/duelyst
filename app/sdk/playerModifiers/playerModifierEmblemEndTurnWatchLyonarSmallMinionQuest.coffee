PlayerModifierEmblemEndTurnWatch = require './playerModifierEmblemEndTurnWatch'
CONFIG = require 'app/common/config'
ModifierTransformed = require 'app/sdk/modifiers/modifierTransformed'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
GameFormat = require 'app/sdk/gameFormat'
_ = require 'underscore'

class PlayerModifierEmblemEndTurnWatchLyonarSmallMinionQuest extends PlayerModifierEmblemEndTurnWatch

  type:"PlayerModifierEmblemEndTurnWatchLyonarSmallMinionQuest"
  @type:"PlayerModifierEmblemEndTurnWatchLyonarSmallMinionQuest"

  maxStacks: 1

  @createContextObject: (options) ->
    contextObject = super(true, false, options)
    return contextObject

  onTurnWatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      for unit in @getGameSession().getBoard().getFriendlyEntitiesAroundEntity(@getCard(), CardType.Unit, CONFIG.WHOLE_BOARD_RADIUS, false, false)
        if unit? and !unit.getIsGeneral() and unit.getBaseCardId() != Cards.Faction1.RightfulHeir

          originalCost = unit.getManaCost()
          newCost = originalCost + 1

          allMinions = []
          if @getGameSession().getGameFormat() is GameFormat.Standard
            allMinions = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(@getCard().getFactionId()).getType(CardType.Unit).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getCards()
          else
            allMinions = @getGameSession().getCardCaches().getFaction(@getCard().getFactionId()).getType(CardType.Unit).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getCards()

          if allMinions.length > 0
            availableMinionAtCost = false
            possibleCards = []
            while !availableMinionAtCost and newCost >= 0
              tempPossibilities = []
              for minion in allMinions
                if minion?.getManaCost() == newCost and minion.getBaseCardId() != Cards.Faction1.RightfulHeir
                  possibleCards.push(minion)
              if possibleCards.length > 0
                availableMinionAtCost = true
              else
                possibleCards = []
                newCost--

            if possibleCards?.length > 0
              # filter mythron cards
              possibleCards = _.reject(possibleCards, (card) ->
                return card.getRarityId() == 6
              )

            if possibleCards.length > 0
              newUnit = possibleCards[@getGameSession().getRandomIntegerForExecution(possibleCards.length)]

              if newUnit.getManaCost() > unit.getManaCost()
                removeOriginalEntityAction = new RemoveAction(@getGameSession())
                removeOriginalEntityAction.setOwnerId(@getCard().getOwnerId())
                removeOriginalEntityAction.setTarget(unit)
                @getGameSession().executeAction(removeOriginalEntityAction)

                newCardData = newUnit.createNewCardData()
                newCardData.additionalInherentModifiersContextObjects ?= []
                newCardData.additionalInherentModifiersContextObjects.push(ModifierTransformed.createContextObject(unit.getExhausted(), unit.getMovesMade(), unit.getAttacksMade()))
                spawnEntityAction = new PlayCardAsTransformAction(@getCard().getGameSession(), @getCard().getOwnerId(), unit.getPosition().x, unit.getPosition().y, newCardData)
                @getGameSession().executeAction(spawnEntityAction)

module.exports = PlayerModifierEmblemEndTurnWatchLyonarSmallMinionQuest
