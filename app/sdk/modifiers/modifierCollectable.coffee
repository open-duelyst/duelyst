Logger = require('app/common/logger')
Modifier = require './modifier'

class ModifierCollectable extends Modifier

  type:"ModifierCollectable"
  @type:"ModifierCollectable"

  @modifierName:"Collectable"
  @description: "When another entity moves onto this location.."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true
  depleted: false # whether collectable has been used
  fxResource: ["FX.Modifiers.ModifierCollectable"]

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.collectingEntity = null

    return p

  getDepleted: ()->
    return @depleted

  getCollectingEntity: () ->
    entities = @getGameSession().getBoard().getEntitiesAtPosition(@getCard().getPosition())
    for entity in entities
      # get the current obstructing entity at my entity's location
      # entity must also not be the same team as my entity
      if entity.getIsObstructing() and (@getCard().getIsSameTeamAs(entity) or @getCard().isOwnedByGameSession())
        return entity

  _onActiveChange: (e) ->
    super(e)
    if @_private.cachedIsActive and !@depleted
      # if there is an obstructing entity at my entity's location
      collectingEntity = @getCollectingEntity()
      if collectingEntity?
        @depleted = true

        # set self as triggering
        @getGameSession().pushTriggeringModifierOntoStack(@)

        # set occupant
        @_private.collectingEntity = collectingEntity
        @getCard().setOccupant(@_private.collectingEntity)

        # do collection
        @onCollect(collectingEntity)

        # deplete
        @onDepleted()

        # stop triggering
        @getGameSession().popTriggeringModifierFromStack()

  onCollect: (entity) ->
    # override me in sub classes to implement special behavior

  onDepleted: () ->
    entity = @getCard()
    @getGameSession().removeModifier(@)
    if entity.getNumModifiersOfClass(ModifierCollectable) == 0
      entity.setDepleted(true)

  postDeserialize: () ->
    super()

    # get the current obstructing entity at my entity's location
    @_private.collectingEntity = @getCollectingEntity()

module.exports = ModifierCollectable
