Modifier = require './modifier'
ApplyModifierAction = require 'app/sdk/actions/applyModifierAction'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'
ModifierStunnedVanar = require 'app/sdk/modifiers/modifierStunnedVanar'
ModifierStun = require 'app/sdk/modifiers/modifierStun'

class ModifierEnemyStunWatch extends Modifier

  type:"ModifierEnemyStunWatch"
  @type:"ModifierEnemyStunWatch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  onBeforeAction: (e) ->
    super(e)

    action = e.action

    # watch for a stun being used on an enemy
    if (action instanceof ApplyModifierAction) and (action.getModifier() instanceof ModifierStunned or action.getModifier() instanceof ModifierStunnedVanar or action.getModifier() instanceof ModifierStun) and action.getTarget().getOwnerId() isnt @getCard().getOwnerId()
      @onEnemyStunWatch(action)

  onEnemyStunWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierEnemyStunWatch
