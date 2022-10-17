ModifierBackstabWatch = require './modifierBackstabWatch'
ModifierBuilding = require './modifierBuilding'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
RemoveAction = require 'app/sdk/actions/removeAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'

class ModifierBackstabWatchTransformToBuilding extends ModifierBackstabWatch

  type:"ModifierBackstabWatchTransformToBuilding"
  @type:"ModifierBackstabWatchTransformToBuilding"

  cardDataOrIndexToSpawn: null
  buildModifierDescription: null

  @createContextObject: (buildingToSpawn, buildModifierDescription, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = buildingToSpawn
    contextObject.buildModifierDescription = buildModifierDescription
    return contextObject

  onBackstabWatch: (action) ->
    # create the action to spawn the new entity before the existing entity is removed
    # because we may need information about the existing entity being replaced
    @cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects ?= []
    @cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(ModifierBuilding.createContextObject(@buildModifierDescription, {id: Cards.Faction2.Penumbraxx}, 1))
    spawnAction = new PlayCardAsTransformAction(@getGameSession(), @getCard().getOwnerId(), @getCard().getPositionX(), @getCard().getPositionY(), @cardDataOrIndexToSpawn)

    # remove the existing entity
    removingEntity = @getGameSession().getBoard().getCardAtPosition(@getCard().getPosition(), CardType.Unit)
    if removingEntity?
      removeOriginalEntityAction = new RemoveAction(@getGameSession())
      removeOriginalEntityAction.setOwnerId(@getCard().getOwnerId())
      removeOriginalEntityAction.setTarget(removingEntity)
      @getGameSession().executeAction(removeOriginalEntityAction)

    # spawn the new entity
    if spawnAction?
      @getGameSession().executeAction(spawnAction)

module.exports = ModifierBackstabWatchTransformToBuilding
