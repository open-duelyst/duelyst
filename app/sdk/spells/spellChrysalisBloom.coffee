CONFIG = require 'app/common/config'
SpellSpawnEntity =   require './spellSpawnEntity'
SpellFilterType = require './spellFilterType'
ModifierEgg = require 'app/sdk/modifiers/modifierEgg'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Factions = require 'app/sdk/cards/factionsLookup'
Rarity = require 'app/sdk/cards/rarityLookup'
CardType = require 'app/sdk/cards/cardType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameFormat = require 'app/sdk/gameFormat'
_ = require("underscore")

class SpellChrysalisBloom extends SpellSpawnEntity

  cardDataOrIndexToSpawn: {id: Cards.Faction5.Egg}
  numEggs: 4

  timesApplied: 0 # we'll increment this each time we apply an egg to board, so that we can apply different egg types

  spellFilterType: SpellFilterType.None

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    # get 1 common, 1 rare, 1 epic, and 1 legendary Magmar unit to put in the eggs
    cardCache = []
    cards = []

    if @getGameSession().getGameFormat() is GameFormat.Standard
      cardCache = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(Factions.Faction5).getIsHiddenInCollection(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getType(CardType.Unit)
    else
      cardCache = @getGameSession().getCardCaches().getFaction(Factions.Faction5).getIsHiddenInCollection(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getType(CardType.Unit)

    switch @timesApplied
      when 0
        cards = cardCache.getRarity(Rarity.Common).getCards()
      when 1
        cards = cardCache.getRarity(Rarity.Rare).getCards()
      when 2
        cards = cardCache.getRarity(Rarity.Epic).getCards()
      when 3
        cards = cardCache.getRarity(Rarity.Legendary).getCards()

    if cards?.length > 0
      # get random card to spawn from egg
      card = cards[@getGameSession().getRandomIntegerForExecution(cards.length)]

      # add modifiers to card data
      cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn(x, y)
      if cardDataOrIndexToSpawn? and !_.isObject(cardDataOrIndexToSpawn) then cardDataOrIndexToSpawn = @getGameSession().getCardByIndex(cardDataOrIndexToSpawn).createNewCardData()
      cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects ?= []
      cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(ModifierEgg.createContextObject(card.createNewCardData(), card.getName()))

      # spawn next egg
      spawnAction = @getSpawnAction(x, y, cardDataOrIndexToSpawn)
      if spawnAction?
        @getGameSession().executeAction(spawnAction)

    # increment
    @timesApplied++

  _findApplyEffectPositions: (position, sourceAction) ->
    wholeBoardPattern = CONFIG.ALL_BOARD_POSITIONS
    card = @getEntityToSpawn()
    applyEffectPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, wholeBoardPattern, card, @, @numEggs)

    return applyEffectPositions

  getAppliesSameEffectToMultipleTargets: () ->
    return true

module.exports = SpellChrysalisBloom
