CONFIG = require '../../common/config'
SpellSpawnEntity = require './spellSpawnEntity'
UtilsGameSession = require '../../common/utils/utils_game_session.coffee'
ModifierEgg = require 'app/sdk/modifiers/modifierEgg'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'

###
  Spawns a new entity nearby my general.
###
class SpellReggplicate extends SpellSpawnEntity

  spawnSilently: true

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      minions = []
      actions = []

      currentTurn = @getGameSession().getCurrentTurn()
      turns = [].concat(@getGameSession().getTurns(), currentTurn)

      for turn in turns
        for step in turn.getSteps()
          actions.push(step.getAction().getFlattenedActionTree())
        for action in actions
          for subaction in action
            if subaction instanceof PlayCardFromHandAction and
            subaction.getCard()?.getRootCard()?.getType() is CardType.Unit and
            subaction.getCard().getRootCard() is subaction.getCard() and
            !subaction.getIsImplicit() and
            subaction.getOwnerId() == @getOwnerId()
              minions.push(subaction.getCard()?.getRootCard())

      if minions.length > 0
        @cardDataOrIndexToSpawn = {id: Cards.Faction5.Egg}
        @cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects = [ModifierEgg.createContextObject(minions[minions.length - 1].createNewCardData())]
        super(board,x,y,sourceAction)

module.exports = SpellReggplicate
