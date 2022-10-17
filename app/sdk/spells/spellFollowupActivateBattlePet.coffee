Spell =  require './spell'
CardType = require 'app/sdk/cards/cardType'
PlayerModifierBattlePetManager = require 'app/sdk/playerModifiers/playerModifierBattlePetManager'
RefreshExhaustionAction =  require 'app/sdk/actions/refreshExhaustionAction'

class SpellFollowupActivateBattlePet extends Spell

  targetType: CardType.Unit

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative()
      applyEffectPosition = {x: x, y: y}
      target = board.getCardAtPosition(applyEffectPosition, @targetType)
      if target.getIsBattlePet()
        general = @getGameSession().getGeneralForPlayerId(target.getOwnerId())
        general.getModifierByClass(PlayerModifierBattlePetManager).triggerBattlePet(target)
      else
        refreshExhaustionAction = new RefreshExhaustionAction(@getGameSession())
        refreshExhaustionAction.setTarget(target)
        @getGameSession().executeAction(refreshExhaustionAction)

module.exports = SpellFollowupActivateBattlePet
