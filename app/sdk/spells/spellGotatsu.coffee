PlayerModifierCardDrawModifier = require 'app/sdk/playerModifiers/playerModifierCardDrawModifier'
SpellDamage = require 'app/sdk/spells/spellDamage'

class SpellGotatsu extends SpellDamage

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    ownerId = @getOwnerId()
    general = @getGameSession().getGeneralForPlayerId(ownerId)
    @getGameSession().applyModifierContextObject(PlayerModifierCardDrawModifier.createContextObject(1,1), general)

module.exports = SpellGotatsu