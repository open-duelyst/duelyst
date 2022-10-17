ModifierUntargetable = require './modifierUntargetable'
DieAction = require 'app/sdk/actions/dieAction'
DamageAction = require 'app/sdk/actions/damageAction'
HealAction = require 'app/sdk/actions/healAction'
HurtingDamageAction = require 'app/sdk/actions/hurtingDamageAction'
AttackAction = require 'app/sdk/actions/attackAction'
MoveAction = require 'app/sdk/actions/moveAction'
ResignAction = require 'app/sdk/actions/resignAction'

i18next = require('i18next')

class ModifierInvulnerable extends ModifierUntargetable

  type:"ModifierInvulnerable"
  @type:"ModifierInvulnerable"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.invulnerable_def")
  @modifierName: i18next.t("modifiers.invulnerable_name")
  #@keywordDefinition: i18next.t("modifiers.structure_def")
  #@modifierName:i18next.t("modifiers.structure_name")
  @description:null

  maxStacks: 1
  isRemovable: false

  fxResource: ["FX.Modifiers.ModifierInvulnerable"]


  onValidateAction: (event) ->
    super(event)

    action = event.action

    # when this would die, invalidate the death UNLESS it is a player initiated resign
    if action instanceof DieAction and !(action instanceof ResignAction) and action.getTarget() is @getCard()
      @invalidateAction(action)
    # invalidate any damage actions against this, EXCEPT from card draw fatigue damage
    else if action instanceof DamageAction and action.getTarget() is @getCard() and !(action instanceof HurtingDamageAction)
      @invalidateAction(action)
    # invalidate any heal actions that target this
    else if action instanceof HealAction and action.getTarget() is @getCard()
      @invalidateAction(action)
    # if this somehow tries to attack or move, invalidate that action
    else if (action instanceof MoveAction or action instanceof AttackAction) and action.getSource() is @getCard()
      @invalidateAction(action)

module.exports = ModifierInvulnerable
