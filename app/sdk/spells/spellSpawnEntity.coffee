CONFIG = require 'app/common/config'
UtilsJavascript = require 'app/common/utils/utils_javascript'
SpellApplyEntityToBoard =   require('./spellApplyEntityToBoard')
CardType = require('app/sdk/cards/cardType')
SpellFilterType = require './spellFilterType'
PlayCardAction = require 'app/sdk/actions/playCardAction'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
_ = require('underscore')

class SpellSpawnEntity extends SpellApplyEntityToBoard

  targetType: CardType.Entity
  spellFilterType: SpellFilterType.None
  cardDataOrIndexToSpawn: null # id of card to spawn
  spawnSilently: false # whether entity should be spawned silently

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.targetsSpace = true # does not target any unit directly
    return p

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn(x, y)
    spawnAction = @getSpawnAction(x, y, cardDataOrIndexToSpawn)
    if spawnAction?
      @getGameSession().executeAction(spawnAction)

  getCardDataOrIndexToSpawn: (x, y) ->
    cardDataOrIndexToSpawn = @cardDataOrIndexToSpawn
    if cardDataOrIndexToSpawn? and _.isObject(cardDataOrIndexToSpawn) then cardDataOrIndexToSpawn = UtilsJavascript.fastExtend({}, cardDataOrIndexToSpawn)
    return cardDataOrIndexToSpawn

  getSpawnAction: (x, y, cardDataOrIndexToSpawn) ->
    targetPosition = {x: x, y: y}
    if !cardDataOrIndexToSpawn? then cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn(x, y)
    entity = @getEntityToSpawn(cardDataOrIndexToSpawn)
    if entity and !@getGameSession().getBoard().getObstructionAtPositionForEntity(targetPosition, entity)
      if @spawnSilently
        spawnEntityAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), x, y, cardDataOrIndexToSpawn)
      else
        spawnEntityAction = new PlayCardAction(@getGameSession(), @getOwnerId(), x, y, cardDataOrIndexToSpawn)
    return spawnEntityAction

  getEntityToSpawn: (cardDataOrIndexToSpawn) ->
    if !cardDataOrIndexToSpawn? then cardDataOrIndexToSpawn = @cardDataOrIndexToSpawn
    if cardDataOrIndexToSpawn?
      entity = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(cardDataOrIndexToSpawn)
      if entity?
        entity.setOwnerId(@getOwnerId())
        return entity

module.exports = SpellSpawnEntity
