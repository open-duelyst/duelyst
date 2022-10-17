CardType = require 'app/sdk/cards/cardType'
ModifierSilence =     require 'app/sdk/modifiers/modifierSilence'
SpellSpawnEntityRandomlyAroundTarget = require './spellSpawnEntityRandomlyAroundTarget.coffee'
_ = require 'underscore'
Cards = require '../cards/cardsLookupComplete.coffee'
UtilsGameSession = require '../../common/utils/utils_game_session.coffee'

class SpellSilenceAndSpawnEntityNearby extends SpellSpawnEntityRandomlyAroundTarget

  targetType: CardType.Unit

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPositions = @getApplyEffectPositions()

    for position in applyEffectPositions
      unit = board.getUnitAtPosition(position)
      if unit? and unit.getOwnerId() != @getOwnerId()
        @getGameSession().applyModifierContextObject(ModifierSilence.createContextObject(), unit)

module.exports = SpellSilenceAndSpawnEntityNearby
