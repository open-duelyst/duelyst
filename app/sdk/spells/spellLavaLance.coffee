SpellDamage = require './spellDamage'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellLavaLance extends SpellDamage

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    @damageAmount = 2 # regular damage of the spell
    for entity in @getGameSession().getBoard().getUnits() # check for any friendly eggs
      if entity?.getOwnerId() is @getOwnerId() and entity.getBaseCardId() is Cards.Faction5.Egg
        # found an egg owned by this player, so set new damage amount on the spell
        @damageAmount = 4
        break
    super(board,x,y,sourceAction)

module.exports = SpellLavaLance
