ModifierStartTurnWatch = require './modifierStartTurnWatch'
Modifier = require './modifier'

CONFIG = require 'app/common/config'

class ModifierStartTurnWatchSwapStats extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchSwapStats"
  @type:"ModifierStartTurnWatchSwapStats"

  @description: "At the start of your turn, fully heal this minion and switch its Attack and Health"

  fxResource: ["FX.Modifiers.ModifierStartTurnWatch"]

  onTurnWatch: (action) ->
    super()

    # reset damage dealt to this minion before swapping
    @getCard().resetDamage()

    # get current attack and health values WITHOUT aura contributions
    oldAttack = @getCard().getATK(false)
    oldHealth = @getCard().getHP(false)

    # apply a hidden modifier that swaps current attack and health
    contextObject = Modifier.createContextObjectWithAttributeBuffs()
    # set the attribute buffs manually in case either one is 0
    contextObject.attributeBuffs.atk = oldHealth
    contextObject.attributeBuffs.maxHP = oldAttack
    contextObject.attributeBuffsAbsolute = ["atk", "maxHP"]

    contextObject.isHiddenToUI = true
    @getCard().getGameSession().applyModifierContextObject(contextObject, @getCard())

module.exports = ModifierStartTurnWatchSwapStats
