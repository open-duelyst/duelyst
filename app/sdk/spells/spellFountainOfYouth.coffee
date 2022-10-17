Logger = require 'app/common/logger'
CONFIG = require 'app/common/config'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
HealAction = require 'app/sdk/actions/healAction'

class SpellFountainOfYouth extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.AllyIndirect

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    position = {x: x, y: y}
    unit = board.getCardAtPosition(position, @targetType)
    if !unit.getIsGeneral() # heal my units, but not my General
      if unit.getDamage() > 0 # only heal if unit is damaged
        healAction = new HealAction(@getGameSession())
        healAction.setOwnerId(@getOwnerId())
        healAction.setTarget(unit)
        healAction.setHealAmount(unit.getDamage()) # heal all damage dealt to this unit
        @getGameSession().executeAction(healAction)

module.exports = SpellFountainOfYouth
