SpellSpawnEntity = require './spellSpawnEntity'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'

class SpellEvilXerox extends SpellSpawnEntity

  spawnSilently: true

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    if @getGameSession().getIsRunningAsAuthoritative()

      minions = []
      actions = []

      turns = @getGameSession().getTurns()
      for turn in turns
        for step in turn.getSteps()
          actions.push(step.getAction().getFlattenedActionTree())
        for action in actions
          for subaction in action
            if subaction instanceof PlayCardFromHandAction and
            subaction.getCard()?.getRootCard()?.getType() is CardType.Unit and
            subaction.getCard().getRootCard() is subaction.getCard() and
            !subaction.getIsImplicit() and
            subaction.getOwnerId() != @getOwnerId()
              minions.push(subaction.getCard()?.getRootCard())

      if minions.length > 0
        cardToSpawn = minions[minions.length - 1].createNewCardData()
        cardToSpawn.additionalModifiersContextObjects = [ModifierFirstBlood.createContextObject(), ModifierFlying.createContextObject()]
        @cardDataOrIndexToSpawn = cardToSpawn
        super(board,x,y,sourceAction)

module.exports = SpellEvilXerox
