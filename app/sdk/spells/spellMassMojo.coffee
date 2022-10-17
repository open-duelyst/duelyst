Spell = require './spell'
Modifier = require 'app/sdk/modifiers/modifier'
ModifierGrow = require 'app/sdk/modifiers/modifierGrow'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'

class SpellMassMojo extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    board = @getGameSession().getBoard()

    for tile in board.getTiles(true, false)
      if tile?.getOwnerId() == @getOwnerId() and tile.getBaseCardId() == Cards.Tile.PrimalMojo
        tilePosition = {x:tile.getPosition().x, y:tile.getPosition().y}
        unitOnTile = board.getCardAtPosition(tilePosition, CardType.Unit)
        # find friendly minions standing on primal flourish tiles who can Grow
        if unitOnTile? and unitOnTile.getOwnerId() is @getOwnerId() and !unitOnTile.getIsGeneral() and unitOnTile.hasActiveModifierClass(ModifierGrow)
          for mod in unitOnTile.getActiveModifiersByClass(ModifierGrow)
            mod.activateGrow() # activate each instance of Grow on the minion

    for unit in board.getUnits(true, false)
      if unit?.getOwnerId() == @getOwnerId() and !unit.getIsGeneral()
        position = unit.getPosition()
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), position.x, position.y, {id: Cards.Tile.PrimalMojo})
        playCardAction.setSource(@)
        @getGameSession().executeAction(playCardAction)

module.exports = SpellMassMojo
