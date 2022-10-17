SpellApplyModifiers = require './spellApplyModifiers'
Modifier = require 'app/sdk/modifiers/modifier'
Races = require 'app/sdk/cards/racesLookup'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellMightOfVespyr extends SpellApplyModifiers

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    
    buffAmount = 0
    allUnits = board.getUnits(true, false)
    if allUnits?
      for unit in allUnits
        if unit? and unit.getOwnerId() is @getOwnerId() and unit.getBelongsToTribe(Races.Vespyr)
          buffAmount += 2

    statContextObject = Modifier.createContextObjectWithAttributeBuffs(buffAmount, buffAmount)
    statContextObject.appliedName = "Vespyrian Might"
    this.setTargetModifiersContextObjects([
      statContextObject
    ])

    super(board,x,y,sourceAction) # apply buff

module.exports = SpellMightOfVespyr
