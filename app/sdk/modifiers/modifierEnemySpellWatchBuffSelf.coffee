Modifier = require './modifier'
ModifierEnemySpellWatch = require './modifierEnemySpellWatch'

class ModifierEnemySpellWatchBuffSelf extends ModifierEnemySpellWatch

  type:"ModifierEnemySpellWatchBuffSelf"
  @type:"ModifierEnemySpellWatchBuffSelf"

  @modifierName:"Enemy Spell Watch Buff Self"
  @description: "Whenever the opponent casts a spell, this minion gains +X/+X"

  fxResource: ["FX.Modifiers.ModifierSpellWatch", "FX.Modifiers.ModifierGenericBuff"]

  statsBuff: null

  @createContextObject: (attackBuff=0, maxHPBuff=0, buffName, options) ->
    contextObject = super(options)
    statsBuff = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    statsBuff.appliedName = buffName
    contextObject.modifiersContextObjects = [statsBuff]
    return contextObject

  onEnemySpellWatch: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierEnemySpellWatchBuffSelf
