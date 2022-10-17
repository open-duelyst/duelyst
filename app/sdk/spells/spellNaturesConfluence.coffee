SpellSpawnEntity =   require './spellSpawnEntity.coffee'
Factions = require 'app/sdk/cards/factionsLookup.coffee'
Races = require 'app/sdk/cards/racesLookup.coffee'

class SpellNaturesConfluence extends SpellSpawnEntity

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    # pick random battle pet ONCE, all battle pets that get spawned will be the same pet
    if !@cardDataOrIndexToSpawn
      # pull faction battle pets + neutral token battle pets
      factionBattlePetCards = @getGameSession().getCardCaches().getFaction(Factions.Faction5).getRace(Races.BattlePet).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      neutralBattlePetCards = @getGameSession().getCardCaches().getFaction(Factions.Neutral).getRace(Races.BattlePet).getIsToken(true).getIsPrismatic(false).getIsSkinned(false).getCards()
      battlePetCards = [].concat(factionBattlePetCards, neutralBattlePetCards)

      card = battlePetCards[@getGameSession().getRandomIntegerForExecution(battlePetCards.length)]
      @cardDataOrIndexToSpawn = card.createNewCardData()

    # spawn random battle pet
    spawnAction = @getSpawnAction(x, y, @cardDataOrIndexToSpawn)
    if spawnAction?
      @getGameSession().executeAction(spawnAction)

module.exports = SpellNaturesConfluence
