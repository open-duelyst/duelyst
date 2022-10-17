Spell = require './spell'
CONFIG = require('app/common/config')
UtilsGameSession = require '../../common/utils/utils_game_session.coffee'
Cards = require 'app/sdk/cards/cardsLookupComplete'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class SpellSummoningStones extends Spell

  onApplyOneEffectToBoard: (board, x, y, sourceAction) ->
    super(board, x, y, sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative()
      foundIds = []

      validCardIds = [
        Cards.Faction3.BrazierRedSand,
        Cards.Faction3.BrazierGoldenFlame,
        Cards.Faction3.BrazierDuskWind,
        Cards.Faction3.SoulburnObelysk,
        Cards.Faction3.LavastormObelysk,
        Cards.Faction3.TrygonObelysk,
        Cards.Faction3.SimulacraObelysk
      ]

      #Determine which obelysk IDs are in the deck
      drawPile = @getOwner().getDeck().getDrawPile()
      for cardIndex, i in drawPile
        cardAtIndex = @getGameSession().getCardByIndex(cardIndex)
        if cardAtIndex?
          cardId = cardAtIndex.getBaseCardId()
          for validId in validCardIds
            if validId == cardId
              alreadyFound = false
              for foundId in foundIds
                if cardId == foundId
                  alreadyFound = true
                  break
              if !alreadyFound
                foundIds.push(validId)
              break

      #for each obelysk ID, summon a random one from deck
      for obelyskId in foundIds
        indexesOfObelysk = []
        for cardIndex, i in drawPile
          cardAtIndex = @getGameSession().getCardByIndex(cardIndex)
          if cardAtIndex?
            cardId = cardAtIndex.getBaseCardId()
            if obelyskId == cardId
              indexesOfObelysk.push(cardIndex)

        indexToSummon = indexesOfObelysk[@getGameSession().getRandomIntegerForExecution(indexesOfObelysk.length)]
        
        if indexToSummon?
          card = @getGameSession().getCardByIndex(indexToSummon)
          validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, CONFIG.ALL_BOARD_POSITIONS, card)
          spawnLocation = validSpawnLocations[@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length)]

          if spawnLocation?
            playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), spawnLocation.x, spawnLocation.y, card)
            playCardAction.setSource(@)
            @getGameSession().executeAction(playCardAction)

module.exports = SpellSummoningStones