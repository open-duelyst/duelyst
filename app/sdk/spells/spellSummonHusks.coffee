SpellKillTarget = require './spellKillTarget'
CONFIG = require('app/common/config')
UtilsGameSession = require '../../common/utils/utils_game_session.coffee'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class SpellSummonHusks extends SpellKillTarget

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    position = {x:x, y:y}
    target = board.getCardAtPosition(position, CardType.Unit)
    if target?
      attack = target.getATK()
      super(board,x,y,sourceAction)

      entity = @getGameSession().getExistingCardFromIndexOrCreateCardFromData({id: Cards.Faction4.Husk})
      spawnPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), position, CONFIG.PATTERN_3x3, entity, @, attack)
      if spawnPositions?
        for spawnPosition in spawnPositions
          spawnEntityAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), spawnPosition.x, spawnPosition.y, {id: Cards.Faction4.Husk})
          @getGameSession().executeAction(spawnEntityAction)

    return true

module.exports = SpellSummonHusks