CONFIG = require 'app/common/config'
UtilsJavascript = require 'app/common/utils/utils_javascript'
SpellApplyEntityToBoard =   require './spellApplyEntityToBoard'
CardType = require('app/sdk/cards/cardType')
Cards = require 'app/sdk/cards/cardsLookupComplete'
SpellFilterType = require './spellFilterType'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
ModifierEgg = require 'app/sdk/modifiers/modifierEgg'
_ = require("underscore")

class SpellEggMorph extends SpellApplyEntityToBoard

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect
  cardDataOrIndexToSpawn: {id: Cards.Faction5.Egg} # if spawning an entity, it will be an egg

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    # check target entity.
    # if it's not already an egg, turn it into an egg
    # if it is an egg, then hatch it immediately
    applyEffectPosition = {x: x, y: y}
    existingEntity = board.getCardAtPosition(applyEffectPosition, CardType.Entity)
    if existingEntity?
      if existingEntity.getBaseCardId() isnt Cards.Faction5.Egg # turning non-egg entity into an egg
        cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn(x, y)

        # create the action to spawn the new egg before the existing entity is removed
        # because we need information about the existing entity being turned into an egg
        spawnAction = @getSpawnAction(x, y, cardDataOrIndexToSpawn)

        # remove the existing entity
        removeOriginalEntityAction = new RemoveAction(@getGameSession())
        removeOriginalEntityAction.setOwnerId(@getOwnerId())
        removeOriginalEntityAction.setTarget(existingEntity)
        @getGameSession().executeAction(removeOriginalEntityAction)

        # spawn the new egg
        if spawnAction?
          @getGameSession().executeAction(spawnAction)
      else # entity is an egg, so let's hatch it
        eggModifier = existingEntity.getModifierByClass(ModifierEgg)
        if eggModifier?
          @getGameSession().pushTriggeringModifierOntoStack(eggModifier)
          eggModifier.removeAndReplace()
          @getGameSession().popTriggeringModifierFromStack()

  getCardDataOrIndexToSpawn: (x, y) ->
    cardDataOrIndexToSpawn = @cardDataOrIndexToSpawn
    if cardDataOrIndexToSpawn?
      isObject = _.isObject(cardDataOrIndexToSpawn)
      if isObject then cardDataOrIndexToSpawn = UtilsJavascript.fastExtend({}, cardDataOrIndexToSpawn)

      existingEntity = @getGameSession().getBoard().getCardAtPosition({x: x, y: y}, CardType.Entity)
      if existingEntity?
        if !isObject then cardDataOrIndexToSpawn = @getGameSession().getCardByIndex(cardDataOrIndexToSpawn).createNewCardData()
        cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects ?= []
        cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(ModifierEgg.createContextObject(existingEntity.createNewCardData()))

    return cardDataOrIndexToSpawn

  getSpawnAction: (x, y, cardDataOrIndexToSpawn) ->
    if !cardDataOrIndexToSpawn? then cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn(x, y)
    entity = @getEntityToSpawn(x, y, cardDataOrIndexToSpawn)
    if entity?
      # we're going to spawn an egg as a transform
      spawnEntityAction = new PlayCardAsTransformAction(@getGameSession(), entity.getOwnerId(), x, y, cardDataOrIndexToSpawn)
    return spawnEntityAction

  getEntityToSpawn: (x, y, cardDataOrIndexToSpawn) ->
    if !cardDataOrIndexToSpawn? then cardDataOrIndexToSpawn = @cardDataOrIndexToSpawn
    if cardDataOrIndexToSpawn?
      existingEntity = @getGameSession().getBoard().getCardAtPosition({x: x, y: y}, CardType.Entity)
      if existingEntity?
        entity = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(cardDataOrIndexToSpawn)
        entity.setOwnerId(existingEntity.getOwnerId())
    return entity

  _postFilterPlayPositions: (validPositions) ->
    # playable anywhere where a unit exists including an egg
    # but NOT a dispelled egg (dispelled egg cannot hatch)
    filteredPositions = []
    for position in validPositions
      entityAtPosition = @getGameSession().getBoard().getEntityAtPosition(position)
      if entityAtPosition? and ( (entityAtPosition.getBaseCardId() isnt Cards.Faction5.Egg) or (entityAtPosition.hasModifierClass(ModifierEgg)) )
        filteredPositions.push(position)
    return filteredPositions

module.exports = SpellEggMorph
