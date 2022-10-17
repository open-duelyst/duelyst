Modifier = require './modifier'
ApplyModifierAction = require 'app/sdk/actions/applyModifierAction'
KillAction = require 'app/sdk/actions/killAction'

class ModifierATKThresholdDie extends Modifier

  type:"ModifierATKThresholdDie"
  @type:"ModifierATKThresholdDie"

  @modifierName:"Modifier ATK Threshold Die"
  @description: "When this unit's attack is greater than %X it dies"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierBuffSelfOnReplace"]

  @createContextObject: (atkThreshold, options) ->
    contextObject = super(options)
    contextObject.atkThreshold = atkThreshold
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      return @description.replace /%X/, modifierContextObject.atkThreshold
    else
      return @description

  onAction: (e) ->
    super(e)

    action = e.action

    if action.getTarget() == @getCard() and action instanceof ApplyModifierAction
      @onATKChange(action)

  onATKChange: (e) ->
    action = e.action

    if @getCard().getATK() > @atkThreshold
      killAction = new KillAction(@getGameSession())
      killAction.setOwnerId(@getCard().getOwnerId())
      killAction.setSource(@getCard())
      killAction.setTarget(@getCard())
      @getGameSession().executeAction(killAction)

module.exports = ModifierATKThresholdDie
