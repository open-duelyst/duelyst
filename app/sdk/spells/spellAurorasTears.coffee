CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =  require './spellFilterType'
Modifier = require 'app/sdk/modifiers/modifier'
_ = require 'underscore'

class SpellAurorasTears extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralIndirect

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    general = board.getCardAtPosition(applyEffectPosition, @targetType)
    # get all artifact modifiers and group by artifact
    modifiersByArtifact = general.getArtifactModifiersGroupedByArtifactCard()
    if modifiersByArtifact.length > 0
      modifierContextObject = Modifier.createContextObjectWithAttributeBuffs(modifiersByArtifact.length * 2,0)
      modifierContextObject.durationEndTurn = 1
      modifierContextObject.appliedName = "Infused Strength"
      @getGameSession().applyModifierContextObject(modifierContextObject,general)

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []

    # can only target your general
    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    if general? then applyEffectPositions.push(general.getPosition())

    return applyEffectPositions

module.exports = SpellAurorasTears
