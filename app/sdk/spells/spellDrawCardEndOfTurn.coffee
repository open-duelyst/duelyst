Spell = require './spell'
PlayerModifierCardDrawModifier = require 'app/sdk/playerModifiers/playerModifierCardDrawModifier'

class SpellDrawCardEndOfTurn extends Spell

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->

    ownerId = @getOwnerId()
    general = @getGameSession().getGeneralForPlayerId(ownerId)
    @getGameSession().applyModifierContextObject(PlayerModifierCardDrawModifier.createContextObject(1,1), general)

module.exports = SpellDrawCardEndOfTurn
