SpellSpawnEntity =   require './spellSpawnEntity'
PlayCardAction = require 'app/sdk/actions/playCardAction'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellSpawnNeutralEntity extends SpellSpawnEntity
  tileAsUnit: true # true = treat tiles as units for valid spawn positions

  getEntityToSpawn: () ->
    if !@tileAsUnit
      return super()
    else
      # return a unit instead of a tile so positioning methods will treat existing units as obstructing
      entity = @getGameSession().getExistingCardFromIndexOrCreateCardFromData({id: Cards.Neutral.KomodoCharger})
      if entity?
        entity.setOwnerId(@getOwnerId())
        return entity

  getSpawnAction: (x, y, cardDataOrIndexToSpawn) ->
    targetPosition = {x: x, y: y}
    if !cardDataOrIndexToSpawn? then cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn(x, y)
    entity = @getEntityToSpawn(cardDataOrIndexToSpawn)
    if entity and !@getGameSession().getBoard().getObstructionAtPositionForEntity(targetPosition, entity)
      if @spawnSilently
        spawnEntityAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), x, y, cardDataOrIndexToSpawn, true)
      else
        spawnEntityAction = new PlayCardAction(@getGameSession(), @getOwnerId(), x, y, cardDataOrIndexToSpawn, true)
    return spawnEntityAction

module.exports = SpellSpawnNeutralEntity
