Logger = require 'app/common/logger'
Spell = require('./spell')
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
SpellFilterType = require './spellFilterType'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
RemoveRandomArtifactAction =  require 'app/sdk/actions/removeRandomArtifactAction'

class SpellRashasCurse extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.EnemyIndirect
  canTargetGeneral: true

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    target = board.getCardAtPosition(applyEffectPosition, @targetType)
    dervish = @getGameSession().getCardCaches().getCardById(Cards.Faction3.Dervish)

    validFollowupPositions = []
    for position in UtilsGameSession.getValidBoardPositionsFromPattern(board, applyEffectPosition, CONFIG.PATTERN_3x3)
      if !board.getObstructionAtPositionForEntity(position, dervish)
        validFollowupPositions.push(position)

    if validFollowupPositions.length == 0 # if there is nowhere to summon a dervish, still DO remove artifacts from General
      #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "RemoveArtifactsAction::onApplyEffectToBoardTile"
      removeArtifactAction = new RemoveRandomArtifactAction(@getGameSession())
      removeArtifactAction.setTarget(target)
      @getGameSession().executeAction(removeArtifactAction)
    # if there is a followup position available, let the followup spell remove the artifact
    # NOTE: usually the artifact should be removed in the followup, because otherwise it would be possible
    # to cheat and check which artifact is randomly removed, canceling until you get the one you want

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []

    # can only target enemy general
    general = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    if general? then applyEffectPositions.push(general.getPosition())

    return applyEffectPositions

module.exports = SpellRashasCurse
