CONFIG = require 'app/common/config'
Modifier = require './modifier'
ModifierWall = require './modifierWall'
ModifierOpeningGambitApplyModifiers = require './modifierOpeningGambitApplyModifiers'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

class ModifierOpeningGambitRazorback extends ModifierOpeningGambitApplyModifiers

  ###
  OpeningGambitApplyModifers - but specifically exclude walls minions
  ###

  type:"ModifierOpeningGambitRazorback"
  @type:"ModifierOpeningGambitRazorback"

  @createContextObject: (modifiersContextObjects, managedByCard, description, options) ->
    contextObject = super(modifiersContextObjects, managedByCard, false, true, false, false, CONFIG.WHOLE_BOARD_RADIUS, description, options)
    return contextObject

  getAffectedEntities: () ->
    entityList = super()
    affectedEntities = []
    for entity in entityList
      if !entity.hasModifierType(ModifierWall.type)
        affectedEntities.push(entity)
    return affectedEntities


module.exports = ModifierOpeningGambitRazorback
