Modifier = require './modifier'
ModifierDyingWish = require './modifierDyingWish'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

class ModifierDyingWishApplyModifiers extends ModifierDyingWish

  ###
  This modifier is used to apply modifiers entities around an entity when that entity dies.
  examples:
  All nearby friendly minions gain strikeback
  All nearby enemy minions gain -2 attack
  ###

  type:"ModifierDyingWishApplyModifiers"
  @type:"ModifierDyingWishApplyModifiers"

  @description: ""

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, auraIncludeSelf, auraIncludeAlly, auraIncludeEnemy, auraRadius, canTargetGeneral, description, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.auraIncludeAlly = auraIncludeAlly
    contextObject.auraIncludeEnemy = auraIncludeEnemy
    contextObject.auraIncludeSelf = auraIncludeSelf
    contextObject.auraRadius = auraRadius
    contextObject.canTargetGeneral = canTargetGeneral
    contextObject.description = description
    return contextObject

  onDyingWish: (action) ->
    if @modifiersContextObjects?
      for entity in @getAffectedEntities()
        for modifierContextObject in @modifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, entity)

  getAffectedEntities: (action) ->
    entityList = @getGameSession().getBoard().getCardsWithinRadiusOfPosition(@getCard().position, @auraFilterByCardType, @auraRadius, @auraIncludeSelf)
    affectedEntities = []
    for entity in entityList
      if (@auraIncludeAlly and entity.getIsSameTeamAs(@getCard())) or (@auraIncludeEnemy and !entity.getIsSameTeamAs(@getCard()))
        if @canTargetGeneral or !entity.getIsGeneral()
          affectedEntities.push(entity)
    return affectedEntities


module.exports = ModifierDyingWishApplyModifiers
