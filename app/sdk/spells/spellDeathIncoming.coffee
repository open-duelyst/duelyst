Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
KillAction = require 'app/sdk/actions/killAction'
PlayerModifierEndTurnRespawnEntityAnywhere = require 'app/sdk/playerModifiers/playerModifierEndTurnRespawnEntityAnywhere'

class SpellDeathIncoming extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    target = board.getCardAtPosition({x:x, y:y}, CardType.Unit)
    if target?
      if !target.getIsGeneral()
        respawnModifier = PlayerModifierEndTurnRespawnEntityAnywhere.createContextObject(target.createNewCardData())
        @getGameSession().applyModifierContextObject(respawnModifier, @getGameSession().getGeneralForPlayerId(@getOwnerId()))

        # then kill the target unit
        killAction = new KillAction(@getGameSession())
        killAction.setOwnerId(@getOwnerId())
        killAction.setTarget(target)
        @getGameSession().executeAction(killAction)

module.exports = SpellDeathIncoming
