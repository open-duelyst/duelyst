CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Spell = require './spell.coffee'
ModifierPseudoRush =     require 'app/sdk/modifiers/modifierPseudoRush'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'

class SpellMarchOfTheBrontos extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    position = {x:x,y:y}
    unit = @getGameSession().getBoard().getUnitAtPosition(position)
    if unit?.getBaseCardId() == Cards.Faction5.Egg and
    unit.getOwnerId() == @getOwnerId()
      removeOriginalEntityAction = new RemoveAction(@getGameSession())
      removeOriginalEntityAction.setOwnerId(@getOwnerId())
      removeOriginalEntityAction.setTarget(unit)
      @getGameSession().executeAction(removeOriginalEntityAction)

      unitToSpawn = {id: Cards.Faction5.Megabrontodon}
      unitToSpawn.additionalInherentModifiersContextObjects = [ModifierPseudoRush.createContextObject()]
      spawnEgg = new PlayCardAsTransformAction(@getGameSession(), unit.getOwnerId(), position.x, position.y, unitToSpawn)
      @getGameSession().executeAction(spawnEgg)

  _postFilterApplyPositions: (validPositions) ->
    filteredPositions = []

    if validPositions.length > 0
      # spell only applies to friendly eggs
      for position in validPositions
        if @getGameSession().getBoard().getUnitAtPosition(position).getBaseCardId() == Cards.Faction5.Egg and
        @getGameSession().getBoard().getUnitAtPosition(position).getOwnerId() == @getOwnerId()
          filteredPositions.push(position)

    return filteredPositions

module.exports = SpellMarchOfTheBrontos
