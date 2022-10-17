ModifierImmuneToDamage = require './modifierImmuneToDamage'
CardType = require 'app/sdk/cards/cardType'

class ModifierForcefieldAbsorb extends ModifierImmuneToDamage

  type:"ModifierForcefieldAbsorb"
  @type:"ModifierForcefieldAbsorb"

  @modifierName: "Forcefield Active"
  @description: "This minion takes no damage"

  @isHiddenToUI: true

  isCloneable: false
  maxStacks: 1

  absorbedActionIndex: -1 # index of action this triggered an absorb for, when -1 no damage has been absorbed

  fxResource: ["FX.Modifiers.ModifierForcefieldAbsorb"]

  onModifyActionForExecution: (event) ->
    super(event)

    action = event.action
    if @getIsActionRelevant(action)
      @absorbedActionIndex = action.getIndex()

  onAfterCleanupAction: (event) ->
    super(event)

    # when cleaning up an action, check if this modifier absorbed damage and remove
    action = event.action
    if !@getCanAbsorb() and action?.getIndex() == @absorbedActionIndex
      @getGameSession().removeModifier(@)

  getIsActionRelevant: (action) ->
    return @getCanAbsorb() and super(action)

  getCanAbsorb: () ->
    return @absorbedActionIndex == -1

module.exports = ModifierForcefieldAbsorb
