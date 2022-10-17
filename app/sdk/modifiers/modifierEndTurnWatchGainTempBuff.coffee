ModifierEndTurnWatch = require './modifierEndTurnWatch'
Modifier = require './modifier'

class ModifierEndTurnWatchGainTempBuff extends ModifierEndTurnWatch

  type: "ModifierEndTurnWatchGainTempBuff"
  @type: "ModifierEndTurnWatchGainTempBuff"

  @modifierName: "End Turn Watch Temp Buff"
  @description: "Gain a buff on your opponent's turn"

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch"]

  attackBuff: 0
  healthBuff: 0
  modifierName: null

  onActivate: () ->
    super()

    # when activated on opponent's turn, immediately activate buff for this turn
    if !@getCard().isOwnersTurn()
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(@attackBuff, @healthBuff)
      statContextObject.appliedName = @modifierName
      statContextObject.durationEndTurn = 1
      @getGameSession().applyModifierContextObject(statContextObject, @getCard())

  @createContextObject: (attackBuff=0, healthBuff=0, modifierName, options) ->
    contextObject = super(options)
    contextObject.attackBuff = attackBuff
    contextObject.healthBuff = healthBuff
    contextObject.modifierName = modifierName
    return contextObject

  onTurnWatch: () ->
    super()
    # at end of my turn, activate buff (so it will be active on opponent's turn)
    statContextObject = Modifier.createContextObjectWithAttributeBuffs(@attackBuff, @healthBuff)
    statContextObject.appliedName = @modifierName
    statContextObject.durationEndTurn = 2
    @getGameSession().applyModifierContextObject(statContextObject, @getCard())

module.exports = ModifierEndTurnWatchGainTempBuff
