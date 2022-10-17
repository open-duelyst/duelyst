ModifierOpponentSummonWatch = require './modifierOpponentSummonWatch'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class ModifierOpponentSummonWatchSummonMinionInFront extends ModifierOpponentSummonWatch

  type:"ModifierOpponentSummonWatchSummonMinionInFront"
  @type:"ModifierOpponentSummonWatchSummonMinionInFront"

  cardDataOrIndexToSpawn: null

  @createContextObject: (cardDataOrIndexToSpawn, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    return contextObject

  onSummonWatch: (action) ->

    unit = action.getTarget()
    if unit? and @cardDataOrIndexToSpawn?
      playerOffset = 0
      if unit.isOwnedByPlayer1() then playerOffset = 1 else playerOffset = -1
      inFrontOfPosition = {x:unit.getPosition().x+playerOffset, y:unit.getPosition().y}

      entity = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(@cardDataOrIndexToSpawn)
      board = @getGameSession().getBoard()
      if board.isOnBoard(inFrontOfPosition) and !board.getObstructionAtPositionForEntity(inFrontOfPosition, entity)
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), inFrontOfPosition.x, inFrontOfPosition.y, @cardDataOrIndexToSpawn)
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierOpponentSummonWatchSummonMinionInFront
