ModifierStartTurnWatch = require './modifierStartTurnWatch'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierStartTurnWatchDamageEnemiesInRow extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchDamageEnemiesInRow"
  @type:"ModifierStartTurnWatchDamageEnemiesInRow"

  @modifierName:"Start Watch"
  @description:"At the start of your turn, deal %X damage to enemies in row"

  damageAmount: 0
  damageGeneral: false

  fxResource: ["FX.Modifiers.ModifierStartTurnWatch", "FX.Modifiers.ModifierGenericDamageFire"]

  @createContextObject: (damageAmount=0, damageGeneral=false, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    contextObject.damageGenerals = damageGeneral
    return contextObject

  onTurnWatch: (action) ->

    board = @getCard().getGameSession().getBoard()

    offset = 1
    offsetPosition = {x:@getCard().getPosition().x+offset, y:@getCard().getPosition().y}
    while board.isOnBoard(offsetPosition)
      target = board.getUnitAtPosition(offsetPosition)
      if target? and target.getOwner() isnt @getCard().getOwner() # damage any enemy found
        if @damageGeneral or !target.getIsGeneral()
          damageAction = new DamageAction(@getCard().getGameSession())
          damageAction.setOwnerId(@getCard().getOwnerId())
          damageAction.setTarget(target)
          damageAction.setDamageAmount(@damageAmount)
          @getGameSession().executeAction(damageAction)
      previousOffset = offsetPosition
      offsetPosition = {x:previousOffset.x+offset, y:previousOffset.y}

    offset = -1
    offsetPosition = {x:@getCard().getPosition().x+offset, y:@getCard().getPosition().y}
    while board.isOnBoard(offsetPosition)
      target = board.getUnitAtPosition(offsetPosition)
      if target? and target.getOwner() isnt @getCard().getOwner() # damage any enemy found
        if @damageGeneral or !target.getIsGeneral()
          damageAction = new DamageAction(@getCard().getGameSession())
          damageAction.setOwnerId(@getCard().getOwnerId())
          damageAction.setTarget(target)
          damageAction.setDamageAmount(@damageAmount)
          @getGameSession().executeAction(damageAction)
      previousOffset = offsetPosition
      offsetPosition = {x:previousOffset.x+offset, y:previousOffset.y}

module.exports = ModifierStartTurnWatchDamageEnemiesInRow
