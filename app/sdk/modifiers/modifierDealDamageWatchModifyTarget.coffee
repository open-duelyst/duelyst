Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
ModifierDealDamageWatch = require './modifierDealDamageWatch'
DamageAction = require 'app/sdk/actions/damageAction'
Stringifiers = require 'app/sdk/helpers/stringifiers'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class ModifierDealDamageWatchModifyTarget extends ModifierDealDamageWatch

  type:"ModifierDealDamageWatchModifyTarget"
  @type:"ModifierDealDamageWatchModifyTarget"

  @description:"Whenever this minion damages an enemy minion, %X"

  fxResource: ["FX.Modifiers.ModifierDealDamageWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, description="", options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.description = description
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      return @description.replace /%X/, modifierContextObject.description
    else
      return @description

  onDealDamage: (action) ->
    target = action.getTarget()
    if target? and target.getOwnerId() isnt @getCard().getOwnerId() and CardType.getIsEntityCardType(target.getType()) and !target.getIsGeneral() #don't fire when we hit a General, only when we hit a minion
      if @modifiersContextObjects?
        for modifierContextObject in @modifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, target)

module.exports = ModifierDealDamageWatchModifyTarget
