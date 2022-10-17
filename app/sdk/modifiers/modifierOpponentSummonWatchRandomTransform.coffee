CONFIG = require 'app/common/config'
UtilsJavascript = require 'app/common/utils/utils_javascript'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
ModifierSummonWatch = require './modifierSummonWatch'
CardType = require 'app/sdk/cards/cardType'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
ModifierOpponentSummonWatch = require './modifierOpponentSummonWatch'
CloneEntityAsTransformAction = require 'app/sdk/actions/cloneEntityAsTransformAction'
Modifier = require './modifier'
RemoveAction = require 'app/sdk/actions/removeAction'
Factions = require 'app/sdk/cards/factionsLookup'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierOpponentSummonWatchRandomTransform extends ModifierOpponentSummonWatch

  type:"ModifierOpponentSummonWatchRandomTransform"
  @type:"ModifierOpponentSummonWatchRandomTransform"

  @modifierName:"Opponent Summon Watch"
  @description:"Whenever an enemy summons a minion, transform it into a random minion of the same cost"

  cardDataOrIndexToSpawn: null

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (options) ->
    contextObject = super(options)

    return contextObject

  onSummonWatch: (action) ->
    super(action)

    targetUnit = action.getTarget()
    targetManaCost = targetUnit.getManaCost()
    targetOwnerId = targetUnit.getOwnerId()
    targetPosition = targetUnit.getPosition()

    if targetUnit?
      # find valid minions
      cardCache = @getGameSession().getCardCaches().getIsHiddenInCollection(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getType(CardType.Unit).getCards()
      cards = []
      for card in cardCache
        if card.getManaCost() == targetManaCost
          cards.push(card)

      if cards.length > 0
        # remove original entity
        removeOriginalEntityAction = new RemoveAction(@getGameSession())
        removeOriginalEntityAction.setOwnerId(@getOwnerId())
        removeOriginalEntityAction.setTarget(targetUnit)
        @getGameSession().executeAction(removeOriginalEntityAction)

        # pick randomly from among the units we found with right mana cost
        card = cards[@getGameSession().getRandomIntegerForExecution(cards.length)]
        @cardDataOrIndexToSpawn = card.createNewCardData()

        spawnEntityAction = new PlayCardAsTransformAction(@getCard().getGameSession(), targetOwnerId, targetPosition.x, targetPosition.y, @cardDataOrIndexToSpawn)
        @getGameSession().executeAction(spawnEntityAction)

  getIsCardRelevantToWatcher: (card) ->
    return true #default when no card restrictions are needed

module.exports = ModifierOpponentSummonWatchRandomTransform
