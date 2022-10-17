Spell =  require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
DamageAction = require 'app/sdk/actions/damageAction'
HealAction = require 'app/sdk/actions/healAction'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'

class SpellFirestormOfAgony extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.None
  healMultiplier: 2
  damageMultiplier: 2

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    position = {x: x, y: y}
    entity = board.getCardAtPosition(position, @targetType)
    spellCount = 0

    # calculate number of spells you cast this turn
    actions = []
    for step in @getGameSession().getCurrentTurn().getSteps()
      actions = actions.concat(step.getAction().getFlattenedActionTree())
    for action in actions
      if action instanceof ApplyCardToBoardAction and
      action.getCard()?.getRootCard()?.getType() is CardType.Spell and
      action.getCard().getRootCard() is action.getCard() and
      !action.getIsImplicit() and
      action.getOwnerId() is @getOwnerId()
        spellCount++

    if entity? and entity.getIsGeneral()
      if entity.getOwnerId() == @getOwnerId()
        # heal my general
        healAction = new HealAction(@getGameSession())
        healAction.setOwnerId(@getOwnerId())
        healAction.setTarget(entity)
        healAction.setHealAmount(@healMultiplier * spellCount)
        @getGameSession().executeAction(healAction)
      else
        # damage enemy general
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getOwnerId())
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@damageMultiplier * spellCount)
        @getGameSession().executeAction(damageAction)

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []

    # only affects generals
    enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    if enemyGeneral? then applyEffectPositions.push(enemyGeneral.getPosition())
    myGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    if myGeneral? then applyEffectPositions.push(myGeneral.getPosition())

    return applyEffectPositions

module.exports = SpellFirestormOfAgony
