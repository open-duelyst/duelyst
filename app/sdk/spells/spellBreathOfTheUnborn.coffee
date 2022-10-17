Logger = require 'app/common/logger'
CONFIG = require 'app/common/config'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
DamageAction = require 'app/sdk/actions/damageAction'
HealAction = require 'app/sdk/actions/healAction'

class SpellBreathOfTheUnborn extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralIndirect
  damageAmount: 2

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x:x, y:y}
    unit = board.getCardAtPosition(applyEffectPosition, @targetType)
    if unit?
      if !unit.getIsGeneral() # never affect Generals
        if unit.getOwnerId() is @getOwnerId() # friendly unit
          if unit.getDamage() > 0 # only heal if unit is damaged
            healAction = new HealAction(@getGameSession())
            healAction.setOwnerId(@getOwnerId())
            healAction.setTarget(unit)
            healAction.setHealAmount(unit.getDamage()) # heal all damage dealt to this unit
            @getGameSession().executeAction(healAction)
        else
          damageAction = new DamageAction(@getGameSession())
          damageAction.setOwnerId(@getOwnerId())
          damageAction.setTarget(unit)
          damageAction.setDamageAmount(@damageAmount)
          @getGameSession().executeAction(damageAction)

module.exports = SpellBreathOfTheUnborn
