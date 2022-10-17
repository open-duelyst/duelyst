SpellSpawnEntity =   require './spellSpawnEntity'
Factions = require 'app/sdk/cards/factionsLookup'
CardType = require 'app/sdk/cards/cardType'
KillAction = require 'app/sdk/actions/killAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'
GameFormat = require 'app/sdk/gameFormat'
_ = require 'underscore'

class SpellMoltenRebirth extends SpellSpawnEntity

  cardDataOrIndexToSpawn: {id: Cards.Faction5.Rex}
  spawnSilently: true

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    # find unit that is to be killed (followup source)
    targetUnit = board.getUnitAtPosition(@getFollowupSourcePosition())
    targetManaCost = targetUnit.getManaCost()

    if targetUnit?
      # kill original entity
      killAction = new KillAction(@getGameSession())
      killAction.setOwnerId(@getOwnerId())
      killAction.setTarget(targetUnit)
      @getGameSession().executeAction(killAction)

      # find valid Magmar minions with cost 1 greater than the source unit
      cardCache = []
      if @getGameSession().getGameFormat() is GameFormat.Standard
        cardCache = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(Factions.Faction5).getIsHiddenInCollection(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getType(CardType.Unit).getCards()
      else
        cardCache = @getGameSession().getCardCaches().getFaction(Factions.Faction5).getIsHiddenInCollection(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getType(CardType.Unit).getCards()

      if cardCache.length > 0
        cards = []
        for card in cardCache
          if card.getManaCost() == targetManaCost + 1
            cards.push(card)

        if cards?.length > 0
          # filter mythron cards
          cards = _.reject(cards, (card) ->
            return card.getRarityId() == 6
          )

        # pick randomly from among the Magmar units we found with right mana cost
        if cards.length > 0
          card = cards[@getGameSession().getRandomIntegerForExecution(cards.length)]
          @cardDataOrIndexToSpawn = card.createNewCardData()

          super(board,x,y,sourceAction)

module.exports = SpellMoltenRebirth
