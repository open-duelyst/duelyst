Modifier = require 'app/sdk/modifiers/modifier'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'

class SpellVaathsSpirit extends SpellApplyModifiers

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    statContextObject = Modifier.createContextObjectWithAttributeBuffs(1)
    statContextObject.appliedName = "Immortal Strength"
    @getGameSession().applyModifierContextObject(statContextObject, general)

module.exports = SpellVaathsSpirit