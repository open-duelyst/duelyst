SpellApplyModifiers = require './spellApplyModifiers'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =  require './spellFilterType'
Races = require 'app/sdk/cards/racesLookup'
Modifier = require 'app/sdk/modifiers/modifier'
_ = require 'underscore'

class SpellPermafrostShield extends SpellApplyModifiers

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.AllyDirect

  attackBuff: 0
  healthBuff: 0

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    applyEffectPosition = {x: x, y: y}
    entity = board.getCardAtPosition(applyEffectPosition, @targetType)
    if entity.getBelongsToTribe(Races.Vespyr)
      @targetModifiersContextObjects  = [Modifier.createContextObjectWithAttributeBuffs(@attackBuff, @healthBuff)]
    else
      @targetModifiersContextObjects  = [Modifier.createContextObjectWithAttributeBuffs(@attackBuff)]
    @targetModifiersContextObjects[0].appliedName = "Frozen Resolve"
    super(board, x, y, sourceAction)

module.exports = SpellPermafrostShield
