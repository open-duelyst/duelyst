CONFIG = require 'app/common/config'
SpellSpawnEntity =   require './spellSpawnEntity'
SpellFilterType = require './spellFilterType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class SpellAmbush extends SpellSpawnEntity

  spellFilterType: SpellFilterType.None

  cardDataOrIndexToSpawn: {id: Cards.Faction6.WyrBeast}

  unitsToSpawn: [
      {id: Cards.Faction6.WolfRaven},
      {id: Cards.Faction6.CrystalCloaker},
      {id: Cards.Faction6.WyrBeast},
      {id: Cards.Faction6.WyrBeast}
    ]

  timesApplied: 0 # we'll increment this each time we apply spawn a unit so we can grab each unit from the 'snow patrol'

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    if @unitsToSpawn.length > 0
      # get next unit to spawn
      card = @unitsToSpawn[@timesApplied]
      @timesApplied++

      # spawn the card
      spawnAction = @getSpawnAction(x, y, card)
      if spawnAction?
        @getGameSession().executeAction(spawnAction)

  _findApplyEffectPositions: (position, sourceAction) ->
    # spell summons units on enemy side of the board
    # begin with "my side" defined as whole board
    enemySideStartX = 0
    enemySideEndX = CONFIG.BOARDCOL
    infiltratePattern = []

    if @isOwnedByPlayer1()
      enemySideStartX = Math.floor((enemySideEndX - enemySideStartX) * 0.5 + 1)
    else if @isOwnedByPlayer2()
      enemySideEndX = Math.floor((enemySideEndX - enemySideStartX) * 0.5 - 1)

    for position in @getGameSession().getBoard().getUnobstructedPositionsForEntity(@getEntityToSpawn())
      if position.x >= enemySideStartX and position.x <= enemySideEndX
        infiltratePattern.push(position)

    card = @getEntityToSpawn()
    applyEffectPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, infiltratePattern, card, @, 4)

    return applyEffectPositions

  getAppliesSameEffectToMultipleTargets: () ->
    return true

module.exports = SpellAmbush
