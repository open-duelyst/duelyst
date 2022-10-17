Spell = require './spell'
SpellSpawnEntity = require './spellSpawnEntity'
Cards = require 'app/sdk/cards/cardsLookupComplete'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CONFIG = require 'app/common/config'
ModifierStartTurnWatchRemoveEntity = require 'app/sdk/modifiers/modifierStartTurnWatchRemoveEntity'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
_ = require 'underscore'

class SpellPandaJail extends SpellSpawnEntity

  cardDataOrIndexToSpawn: {id: Cards.Faction2.OnyxBear}

  getCardDataOrIndexToSpawn: (x, y) ->
    cardDataOrIndexToSpawn = super(x,y)
    if cardDataOrIndexToSpawn? and !_.isObject(cardDataOrIndexToSpawn) then cardDataOrIndexToSpawn = @getGameSession().getCardByIndex(cardDataOrIndexToSpawn).createNewCardData()
    cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects ?= []
    removalModifierContextObject = ModifierStartTurnWatchRemoveEntity.createContextObject()
    removalModifierContextObject.isHiddenToUI = true
    cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(removalModifierContextObject)
    return cardDataOrIndexToSpawn

  _findApplyEffectPositions: (position, sourceAction) ->
    card = @getEntityToSpawn()
    applyEffectPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId()).getPosition(), CONFIG.PATTERN_3x3, card, @, 8)

    return applyEffectPositions

  getAppliesSameEffectToMultipleTargets: () ->
    return true

module.exports = SpellPandaJail
