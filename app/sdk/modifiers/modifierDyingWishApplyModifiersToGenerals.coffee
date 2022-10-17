ModifierDyingWish = require './modifierDyingWish'

class ModifierDyingWishApplyModifiersToGenerals extends ModifierDyingWish

  type:"ModifierDyingWishApplyModifiersToGenerals"
  @type:"ModifierDyingWishApplyModifiersToGenerals"

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericBuff"]

  modifiersContextObjects: null
  includeMyGeneral: true
  includeOppGeneral: true

  @createContextObject: (modifiersContextObjects, includeMyGeneral, includeOppGeneral, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.includeMyGeneral = includeMyGeneral
    contextObject.includeOppGeneral = includeOppGeneral
    return contextObject

  onDyingWish: () ->

    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())

    if @modifiersContextObjects?
      for modifierContextObject in @modifiersContextObjects
        if modifierContextObject?
          if @includeMyGeneral
            @getGameSession().applyModifierContextObject(modifierContextObject, general)
          if @includeOppGeneral
            @getGameSession().applyModifierContextObject(modifierContextObject, enemyGeneral)

module.exports = ModifierDyingWishApplyModifiersToGenerals
