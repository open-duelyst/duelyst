Modifier = require 'app/sdk/modifiers/modifier'
SpellDamage = require 'app/sdk/spells/spellDamage'
Cards = require 'app/sdk/cards/cardsLookupComplete'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class SpellFortifiedAssault extends SpellDamage

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    numTiles = 1
    for tile in board.getTiles(true, false)
      if tile?.getOwnerId() == @getOwnerId() and tile.getBaseCardId() == Cards.Tile.Hallowed
        if !(tile.getPosition().x == x and tile.getPosition().y == y)
          numTiles++

    statContextObject = Modifier.createContextObjectWithAttributeBuffs(0, numTiles)
    statContextObject.appliedName = "Fortification"
    this.setTargetModifiersContextObjects([
        statContextObject
    ])

    this.damageAmount = numTiles
    super(board,x,y,sourceAction)

    playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), x, y, {id: Cards.Tile.Hallowed})
    playCardAction.setSource(@)
    @getGameSession().executeAction(playCardAction)

module.exports = SpellFortifiedAssault
