CONFIG =     require 'app/common/config'
Logger =     require 'app/common/logger'
Action =       require './action'
CardType =       require 'app/sdk/cards/cardType'

class HealAction extends Action

  @type:"HealAction"
  healAmount: 0 # base heal amount, should be set when action first made and then never modified

  constructor: () ->
    @type ?= HealAction.type
    super

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.healChange = 0 # flat heal amount shift, set during modify_action_for_execution phase by modifiers
    p.healMultiplier = 1 # multiplier to total heal, set during modify_action_for_execution phase by modifiers
    p.totalHealAmount = null # cached total heal amount once action has been executed (in case game state changes)
    p.totalHealApplied = null # cached total heal amount actually applied once action has been executed (ex: Heal for 5 on a unit with 2 damage, totalHealApplied=2)

    return p

  getTotalHealAmount: () ->
    @_private.totalHealAmount ?= (@getHealAmount() + @getHealChange()) * @getHealMultiplier()
    return @_private.totalHealAmount

  getHealAmount: () ->
    return @healAmount

  setHealAmount: (healAmount) ->
    @healAmount = healAmount
    @_private.totalHealAmount = null

  getHealChange: () ->
    return @_private.healChange

  setHealChange: (healChange) ->
    @_private.healChange = healChange
    @_private.totalHealAmount = null

  getHealMultiplier: () ->
    return @_private.healMultiplier

  setHealMultiplier: (healMultiplier) ->
    @_private.healMultiplier = healMultiplier
    @_private.totalHealAmount = null

  getTotalHealApplied: () ->
    return @_private.totalHealApplied

  _execute: () ->
    super()

    target = @getTarget()

    if target? and target.getIsActive()
      heal = @getTotalHealAmount()
      targetStartHP = target.getHP()
      target.applyHeal(heal) # heal the target
      targetEndHP = target.getHP()
      @_private.totalHealApplied = targetEndHP - targetStartHP
    else
      @_private.totalHealApplied = 0


module.exports = HealAction
