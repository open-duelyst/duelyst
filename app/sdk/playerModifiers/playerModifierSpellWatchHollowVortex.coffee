PlayerModifierSpellWatch = require './playerModifierSpellWatch'
Factions = require 'app/sdk/cards/factionsLookup'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
GameFormat = require 'app/sdk/gameFormat'
_ = require 'underscore'

###
  Summon watch that remains active whether the original entity dies or not.
###
class PlayerModifierSpellWatchHollowVortex extends PlayerModifierSpellWatch

  type:"PlayerModifierSpellWatchHollowVortex"
  @type:"PlayerModifierSpellWatchHollowVortex"

  @isHiddenToUI: false

  manaCostAddition: 0

  @createContextObject: (manaCostAddition, options) ->
    contextObject = super(options)
    contextObject.manaCostAddition = manaCostAddition
    return contextObject

  onSpellWatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      originalCost = action.getCard().getManaCost()
      newCost = originalCost + @manaCostAddition

      neutralMinions = []
      factionMinions = []
      if @getGameSession().getGameFormat() is GameFormat.Standard
        neutralMinions = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(Factions.Neutral).getType(CardType.Unit).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getCards()
        factionMinions = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(@getCard().getFactionId()).getType(CardType.Unit).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      else
        neutralMinions = @getGameSession().getCardCaches().getFaction(Factions.Neutral).getType(CardType.Unit).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getCards()
        factionMinions = @getGameSession().getCardCaches().getFaction(@getCard().getFactionId()).getType(CardType.Unit).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getCards()

      allMinions = [].concat(factionMinions, neutralMinions)

      if allMinions.length > 0
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
            newCost--

        if possibleCards?.length > 0
          # filter mythron cards
          possibleCards = _.reject(possibleCards, (card) ->
            return card.getRarityId() == 6
          )

        if possibleCards.length > 0
          newUnit = possibleCards[@getGameSession().getRandomIntegerForExecution(possibleCards.length)]
          ownerId = @getPlayerId()
          generalPosition = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId()).getPosition()
          spawnPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), generalPosition, CONFIG.PATTERN_3x3, newUnit, @getCard(), 1)
          for spawnPosition in spawnPositions
            spawnAction = new PlayCardSilentlyAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, newUnit)
            spawnAction.setSource(@getCard())
            @getGameSession().executeAction(spawnAction)

module.exports = PlayerModifierSpellWatchHollowVortex
