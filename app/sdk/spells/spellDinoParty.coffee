CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
ModifierFate = require 'app/sdk/modifiers/modifierFate'

class SpellDinoParty extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative()

      ownerId = @getOwnerId()
      general = @getGameSession().getGeneralForPlayerId(ownerId)
      cardsInHand = @getOwner().getDeck().getCardsInHandExcludingMissing()
      possibleCardsToSummon = []
      for card in cardsInHand
        if card?.getType() is CardType.Unit
          isLockedFateCard = false
          if card.hasActiveModifierClass(ModifierFate)
            for mod in card.getModifiersByClass(ModifierFate)
              if !mod.fateConditionFulfilled()
                isLockedFateCard = true
                break
          if !isLockedFateCard
            possibleCardsToSummon.push(card)

      enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(ownerId)
      enemyId = enemyGeneral.getOwnerId()
      enemyCardsInHand = @getGameSession().getOpponentPlayerOfPlayerId(ownerId).getDeck().getCardsInHandExcludingMissing()
      enemyPossibleCardsToSummon = []
      for enemyCard in enemyCardsInHand
        if enemyCard?.getType() is CardType.Unit
          isLockedFateCard = false
          if enemyCard.hasActiveModifierClass(ModifierFate)
            for mod in enemyCard.getModifiersByClass(ModifierFate)
              if !mod.fateConditionFulfilled()
                isLockedFateCard = true
                break
          if !isLockedFateCard
            enemyPossibleCardsToSummon.push(enemyCard)

      minionsLeftToSummon = true
      enemyMinionsLeftToSummon = true

      while minionsLeftToSummon or enemyMinionsLeftToSummon
        if minionsLeftToSummon
          minionsLeftToSummon = @summonMinion(possibleCardsToSummon, general, ownerId)
        if enemyMinionsLeftToSummon
          enemyMinionsLeftToSummon = @summonMinion(enemyPossibleCardsToSummon, enemyGeneral, enemyId)

  summonMinion: (possibleCardsToSummon, general, ownerId) ->

    if possibleCardsToSummon.length > 0
      generalPosition = general.getPosition()
      cardToSummon = possibleCardsToSummon.splice(@getGameSession().getRandomIntegerForExecution(possibleCardsToSummon.length), 1)[0]
      spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), generalPosition, CONFIG.PATTERN_3x3, cardToSummon, general, 1)

      if spawnLocations? and spawnLocations.length > 0
        locationToSummon = spawnLocations.splice(@getGameSession().getRandomIntegerForExecution(spawnLocations.length), 1)[0]
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), ownerId, locationToSummon.x, locationToSummon.y, cardToSummon.getIndex())
        playCardAction.setSource(general)
        @getGameSession().executeAction(playCardAction)
        return true
    return false

module.exports = SpellDinoParty
