ModifierEnemySpellWatch = require './modifierEnemySpellWatch'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierEnemySpellWatchCopySpell extends ModifierEnemySpellWatch

  type:"ModifierEnemySpellWatchCopySpell"
  @type:"ModifierEnemySpellWatchCopySpell"

  @modifierName:"Enemy Spell Watch Copy Spell"
  @description: "Whenever the opponent casts a spell, gain of copy of the spell"

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  onEnemySpellWatch: (action) ->

    spell = action.getTarget()
    if spell?
      putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), spell.createNewCardData())
      @getGameSession().executeAction(putCardInHandAction)

module.exports = ModifierEnemySpellWatchCopySpell