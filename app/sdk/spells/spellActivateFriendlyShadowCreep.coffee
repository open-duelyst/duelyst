Spell = require './spell'
Cards = require 'app/sdk/cards/cardsLookupComplete'
ModifierStackingShadows = require 'app/sdk/modifiers/modifierStackingShadows'

class SpellActivateFriendlyShadowCreep extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    creepTile = @getGameSession().getBoard().getTileAtPosition({x:x, y:y}, true, false)
    if creepTile? and creepTile.getBaseCardId() == Cards.Tile.Shadow
      modifiers = creepTile.getModifiers()
      if modifiers?
        for modifier in modifiers
          if modifier instanceof ModifierStackingShadows
            modifier.activateShadowCreep()
            break

  _findApplyEffectPositions: (position, sourceAction) ->
    board = @getGameSession().getBoard()
    friendlyCreepPositions = []
    for tile in board.getTiles(true, false)
      if tile? and tile.getOwnerId() == @getOwnerId() and tile.getBaseCardId() == Cards.Tile.Shadow
        friendlyCreepPositions.push({x:tile.getPosition().x, y:tile.getPosition().y})
    return friendlyCreepPositions

module.exports = SpellActivateFriendlyShadowCreep
