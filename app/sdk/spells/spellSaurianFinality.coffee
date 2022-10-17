HealAction = require 'app/sdk/actions/healAction'
RemoveManaCoreAction = require 'app/sdk/actions/removeManaCoreAction'
Modifier = require 'app/sdk/modifiers/modifier'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'
Spell = require './spell'

class SpellSaurianFinality extends Spell

  appliedName: null

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    position = {x: x, y: y}
    entity = board.getCardAtPosition(position, @targetType)

    if entity? and entity is @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId()) # enemy general
      removeManaCoreAction = new RemoveManaCoreAction(@getGameSession(), 3)
      removeManaCoreAction.setSource(@)
      removeManaCoreAction.setOwnerId(@getGameSession().getOpponentPlayerIdOfPlayerId(@getOwnerId()))
      @getGameSession().executeAction(removeManaCoreAction)

      stunnedObject = ModifierStunned.createContextObject()
      @getGameSession().applyModifierContextObject(stunnedObject, @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId()))

    else if entity? and entity is @getGameSession().getGeneralForPlayerId(@getOwnerId()) # my general
      removeManaCoreAction = new RemoveManaCoreAction(@getGameSession(), 3)
      removeManaCoreAction.setSource(@)
      removeManaCoreAction.setOwnerId(@getOwnerId())
      @getGameSession().executeAction(removeManaCoreAction)

      ownGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
      healAction = new HealAction(@getGameSession())
      healAction.setOwnerId(@getOwnerId())
      healAction.setTarget(ownGeneral)
      healAction.setHealAmount(10)
      @getGameSession().executeAction(healAction)

      generalBuff = Modifier.createContextObjectWithAttributeBuffs(3,0)
      generalBuff.appliedName = @appliedName
      @getGameSession().applyModifierContextObject(generalBuff, ownGeneral)

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []

    # affects both generals
    enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    if enemyGeneral? then applyEffectPositions.push(enemyGeneral.getPosition())
    myGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    if myGeneral? then applyEffectPositions.push(myGeneral.getPosition())

    return applyEffectPositions


module.exports = SpellSaurianFinality
