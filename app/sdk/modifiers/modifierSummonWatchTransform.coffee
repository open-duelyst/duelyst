ModifierSummonWatch = require './modifierSummonWatch'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
ModifierTransformed = require 'app/sdk/modifiers/modifierTransformed'

class ModifierSummonWatchTransform extends ModifierSummonWatch

  type:"ModifierSummonWatchTransform"
  @type:"ModifierSummonWatchTransform"

  cardDataOrIndexToSpawn: null

  fxResource: ["FX.Modifiers.ModifierSummonWatch"]

  @createContextObject: (cardDataOrIndexToSpawn, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    return contextObject

  onSummonWatch: (action) ->
    super(action)
    entity = action.getTarget()
    if entity? and @cardDataOrIndexToSpawn? and @getIsValidTransformPosition(entity.getPosition())

      removeOriginalEntityAction = new RemoveAction(@getGameSession())
      removeOriginalEntityAction.setOwnerId(@getCard().getOwnerId())
      removeOriginalEntityAction.setTarget(entity)
      @getGameSession().executeAction(removeOriginalEntityAction)

      @cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects ?= []
      @cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(ModifierTransformed.createContextObject(entity.getExhausted(), entity.getMovesMade(), entity.getAttacksMade()))
      spawnEntityAction = new PlayCardAsTransformAction(@getCard().getGameSession(), @getCard().getOwnerId(), entity.getPosition().x, entity.getPosition().y, @cardDataOrIndexToSpawn)
      @getGameSession().executeAction(spawnEntityAction)

  getIsValidTransformPosition: (summonedUnitPosition) ->
    # override this in subclass to filter by position
    return true

module.exports = ModifierSummonWatchTransform
