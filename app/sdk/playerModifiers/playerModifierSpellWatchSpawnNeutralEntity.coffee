PlayerModifierSpellWatch = require './playerModifierSpellWatch'
Factions = require 'app/sdk/cards/factionsLookup'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

###
  Summon watch that remains active whether the original entity dies or not.
###
class PlayerModifierSpellWatchSpawnNeutralEntity extends PlayerModifierSpellWatch

  type:"PlayerModifierSpellWatchSpawnNeutralEntity"
  @type:"PlayerModifierSpellWatchSpawnNeutralEntity"

  @createContextObject: (options) ->
    contextObject = super(options)
    return contextObject

  onSpellWatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      originalCost = action.getCard().getManaCost()
      newCost = originalCost + 3

      allMinions = @getGameSession().getCardCaches().getFaction(Factions.Neutral).getType(CardType.Unit).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getCards()

      if allMinions?
        availableMinionAtCost = false
        possibleCards = []
        while !availableMinionAtCost and newCost >= 0
          tempPossibilities = []
          for minion in allMinions
            if minion?.getManaCost() == newCost
              possibleCards.push(minion)
          if possibleCards.length > 0
            availableMinionAtCost = true
          else
            possibleCards = []
            newCost--

        if possibleCards.length > 0
          newUnit = possibleCards[@getGameSession().getRandomIntegerForExecution(possibleCards.length)]
          ownerId = @getPlayerId()
          generalPosition = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId()).getPosition()
          spawnPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), generalPosition, CONFIG.PATTERN_3x3, newUnit, @getCard(), 1)
          for spawnPosition in spawnPositions
            spawnAction = new PlayCardSilentlyAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, newUnit)
            spawnAction.setSource(@getCard())
            @getGameSession().executeAction(spawnAction)


module.exports = PlayerModifierSpellWatchSpawnNeutralEntity
