SpellApplyModifiers = require './spellApplyModifiers'
Cards = require 'app/sdk/cards/cardsLookupComplete'
ModifierEphemeral = require 'app/sdk/modifiers/modifierEphemeral'

class SpellDunecasterFollowup extends SpellApplyModifiers

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction) # apply the modifiers passed in from card factory

    # special rules: if target is a Dervish token unit, also make it not disapear at end of turn
    targetUnit = board.getUnitAtPosition({x:x, y:y})
    if targetUnit.getBaseCardId() is Cards.Faction3.Dervish
      # remove ephemeral modifiers
      for mod in targetUnit.getModifiersByClass(ModifierEphemeral)
        @getGameSession().removeModifier(mod)

module.exports = SpellDunecasterFollowup
