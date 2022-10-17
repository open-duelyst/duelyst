CONFIG = require 'app/common/config'
Modifier = require './modifier'
MoveAction = require 'app/sdk/actions/moveAction'
AttackAction =   require 'app/sdk/actions/attackAction'
_ = require 'underscore'

i18next = require('i18next')

class ModifierProvoked extends Modifier

  type: "ModifierProvoked"
  @type: "ModifierProvoked"

  @modifierName: i18next.t("modifiers.provoked_name")
  @description: i18next.t("modifiers.provoked_desc")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  #attributeBuffs:
  #  speed: 0
  #attributeBuffsAbsolute: ["speed"]
  #attributeBuffsFixed: ["speed"]

  fxResource: ["FX.Modifiers.ModifierProvoked"]

  onValidateAction:(actionEvent) ->
    a = actionEvent.action

    # rather than rooting the unit in place, we'll show the regular movement path
    # but if unit attempts to move, block the move action and display an error message
    if @getCard()? and a instanceof MoveAction and a.getIsValid() and @getCard() is a.getSource()
      @invalidateAction(a, @getCard().getPosition(), i18next.t("modifiers.provoked_move_error"))

    # If a unit is provoked it must target one of its provokers
    # First check for valid explicit attack actions
    if @getCard()? and @getCard() is a.getSource() and a instanceof AttackAction and a.getIsValid() and !a.getIsImplicit() and !a.getTarget().getIsSameTeamAs(a.getSource())
      # In the case of attacking a ranged provoker, don't invalidate
      if !(a.getSource().getIsRangedProvoked() and a.getTarget().getIsRangedProvoker())
        # Check to make sure target is a provoker
        if !a.getTarget().getIsProvoker()
          @invalidateAction(a, @getCard().getPosition(), i18next.t("modifiers.provoked_attack_error"))

        # Then check for if target is one of the provokers provoking this unit
        if !_.contains(a.getTarget().getEntitiesProvoked(), @getCard())
          @invalidateAction(a, @getCard().getPosition(), i18next.t("modifiers.provoked_attack_error"))



module.exports = ModifierProvoked
