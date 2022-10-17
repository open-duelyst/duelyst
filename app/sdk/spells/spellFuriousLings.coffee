SpellShadowspawn = require './spellShadowspawn.coffee'
ModifierWraithlingFury = require 'app/sdk/modifiers/modifierWraithlingFury'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellFuriousLings extends SpellShadowspawn

  getCardDataOrIndexToSpawn: (x, y) ->
    cardDataOrIndexToSpawn = super(x, y)
    cardDataOrIndexToSpawn.additionalModifiersContextObjects ?= []
    cardDataOrIndexToSpawn.additionalModifiersContextObjects.push(ModifierWraithlingFury.createContextObject())
    return cardDataOrIndexToSpawn

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    # make all your existing Wraithlings furious
    for unit in board.getUnits()
      if unit? and unit.getBaseCardId() is Cards.Faction4.Wraithling and unit.getOwnerId() is @getOwnerId()
        if !unit.hasModifierType(ModifierWraithlingFury.type)
          @getGameSession().applyModifierContextObject(ModifierWraithlingFury.createContextObject(), unit)

module.exports = SpellFuriousLings
