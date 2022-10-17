SpellApplyModifiers = require './spellApplyModifiers'
ModifierBackstab = require 'app/sdk/modifiers/modifierBackstab'
PlayerModifierCardDrawModifier = require 'app/sdk/playerModifiers/playerModifierCardDrawModifier'
CardType = require 'app/sdk/cards/cardType'

class SpellKillingEdge extends SpellApplyModifiers

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction) # apply buff

    entity = board.getCardAtPosition({x:x, y:y}, CardType.Unit)
    if entity.hasModifierType(ModifierBackstab.type)
      ownerId = @getOwnerId()
      general = @getGameSession().getGeneralForPlayerId(ownerId)
      @getGameSession().applyModifierContextObject(PlayerModifierCardDrawModifier.createContextObject(1,1), general)

module.exports = SpellKillingEdge
