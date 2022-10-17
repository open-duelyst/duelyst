Spell =  require './spell'

class SpellAncestralDivination extends Spell

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    player = @getGameSession().getPlayerById(@getOwnerId())

    # draw one card for each friendly minion on the board
    for unit in @getGameSession().getBoard().getUnits()
      if unit.getOwnerId() is @getOwnerId() and !unit.getIsGeneral()
        action = player.getDeck().actionDrawCard()
        @getGameSession().executeAction(action)

module.exports = SpellAncestralDivination
