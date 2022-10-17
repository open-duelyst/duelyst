CONFIG = require 'app/common/config'
UtilsJavascript = require 'app/common/utils/utils_javascript'
SpellApplyEntityToBoard =   require './spellApplyEntityToBoard'
CardType = require('app/sdk/cards/cardType')
SpellFilterType = require './spellFilterType'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
_ = require('underscore')

class SpellRemoveAndReplaceEntity extends SpellApplyEntityToBoard

  targetType: CardType.Entity
  spellFilterType: SpellFilterType.NeutralDirect
  cardDataOrIndexToSpawn: null # id of card to spawn

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn(x, y)

    # create the action to spawn the new entity before the existing entity is removed
    # because we may need information about the existing entity being replaced
    spawnAction = @getSpawnAction(x, y, cardDataOrIndexToSpawn)

    # remove the existing entity
    removePosition = @getRemovePosition(applyEffectPosition)
    removingEntity = board.getCardAtPosition(removePosition, @targetType)
    if removingEntity?
      removeOriginalEntityAction = new RemoveAction(@getGameSession())
      removeOriginalEntityAction.setOwnerId(@getOwnerId())
      removeOriginalEntityAction.setTarget(removingEntity)
      @getGameSession().executeAction(removeOriginalEntityAction)

    # spawn the new entity
    if spawnAction?
      @getGameSession().executeAction(spawnAction)

  getRemovePosition: (applyEffectPosition) ->
    # override in sub class to provide a custom remove position
    return applyEffectPosition

  getCardDataOrIndexToSpawn: (x, y) ->
    cardDataOrIndexToSpawn = @cardDataOrIndexToSpawn
    if cardDataOrIndexToSpawn? and _.isObject(cardDataOrIndexToSpawn) then cardDataOrIndexToSpawn = UtilsJavascript.fastExtend({}, cardDataOrIndexToSpawn)
    return cardDataOrIndexToSpawn

  getSpawnAction: (x, y, cardDataOrIndexToSpawn) ->
    if !cardDataOrIndexToSpawn? then cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn(x, y)
    entity = @getEntityToSpawn(x, y, cardDataOrIndexToSpawn)
    if entity?
      return new PlayCardAsTransformAction(@getGameSession(), entity.getOwnerId(), x, y, cardDataOrIndexToSpawn)

  getEntityToSpawn: (x, y, cardDataOrIndexToSpawn) ->
    if !cardDataOrIndexToSpawn? then cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn(x, y)
    if cardDataOrIndexToSpawn?
      entity = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(cardDataOrIndexToSpawn)
      existingEntity = @getGameSession().getBoard().getCardAtPosition({x: x, y: y}, CardType.Entity)
      if existingEntity?
        entity.setOwnerId(existingEntity.getOwnerId())
      else
        entity.setOwnerId(@getOwnerId())
    return entity

  _postFilterPlayPositions: (validPositions) ->
    # ignore super class's filtering
    # allow this spell to be played where entities are
    return validPositions

module.exports = SpellRemoveAndReplaceEntity
