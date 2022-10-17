CONFIG = require 'app/common/config'
SpellSpawnEntity = require './spellSpawnEntity'
DieAction = require 'app/sdk/actions/dieAction'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Rarity = require 'app/sdk/cards/rarityLookup'

class SpellFollowupKeeper extends SpellSpawnEntity

  canBeAppliedAnywhere: false
  spawnSilently: true
  cardDataOrIndexToSpawn: {id: Cards.Neutral.KeeperOfTheVale} # default unit for spell positioning

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.followupSourcePattern = CONFIG.PATTERN_3x3 # only allow spawns within a 3x3 area of source position
    p.deadUnits = null

    return p

  getDeadUnits: () ->
    if !@_private.deadUnits?
      @_private.deadUnits = @getGameSession().getDeadUnits(@getOwnerId())
    return @_private.deadUnits

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    entities = @getDeadUnits()
    # find and spawn a dead unit
    if entities.length > 0
      entityToSpawn = entities[@getGameSession().getRandomIntegerForExecution(entities.length)]
      if entityToSpawn?
        @cardDataOrIndexToSpawn = entityToSpawn.createNewCardData()
        super(board,x,y,sourceAction)

  _postFilterPlayPositions: (validPositions) ->
    # don't allow followup if there's nothing to re-summon
    if @getDeadUnits().length > 0
      return super(validPositions)
    else
      return []


module.exports = SpellFollowupKeeper
