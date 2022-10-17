Modifier =   require './modifier'
ApplyCardToBoardAction =   require '../actions/applyCardToBoardAction'
_ = require 'underscore'
i18next = require('i18next')

class ModifierManaCostChange extends Modifier

  type:"ModifierManaCostChange"
  @type:"ModifierManaCostChange"

  @modifierName:i18next.t("modifiers.mana_shift_name")

  attributeBuffs: {
    manaCost: 0
  }

  fxResource: ["FX.Modifiers.ModifierManaCostChange"]

  @createContextObject: (costChange=0, options) ->
    contextObject = super(options)
    contextObject.attributeBuffs = {manaCost: costChange}
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      costChange = modifierContextObject.attributeBuffs.manaCost
      if costChange >= 0
        if modifierContextObject.attributeBuffsAbsolute? and _.contains(modifierContextObject.attributeBuffsAbsolute, "manaCost")
          return i18next.t("modifiers.mana_shift_set",{amount: Math.abs(costChange)})
        else
          return i18next.t("modifiers.mana_shift_plus",{amount: Math.abs(costChange)})
      else if costChange < 0
        return i18next.t("modifiers.mana_shift_minus",{amount: Math.abs(costChange)})

  _onAfterAction:(event) ->
    # destroy this modifier if the card it is applied to has been played
    action = event.action
    if @getCard().getIsPlayed()
      appliedByActionIndex = @getCard().getAppliedToBoardByActionIndex()
      if appliedByActionIndex == -1 || action.getIndex() == appliedByActionIndex
        @getGameSession().removeModifier(@)
        return

    super(event)

module.exports = ModifierManaCostChange
