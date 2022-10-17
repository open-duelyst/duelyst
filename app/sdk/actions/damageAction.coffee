Logger =     require 'app/common/logger'
Action =     require './action'
Colors =     require 'colors' # used for console message coloring
CardType =     require 'app/sdk/cards/cardType'
_ = require 'underscore'

class DamageAction extends Action

  @type:"DamageAction"
  damageAmount: 0 # base damage amount, should be set when action first made and then never modified

  constructor: (gameSession) ->
    @type ?= DamageAction.type
    super(gameSession)

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.damageChange = 0 # flat damage amount shift, set during modify_action_for_execution phase by modifiers (ex: deal 2 additional damage to target)
    p.damageMultiplier = 1 # multiplier to total damage, set during modify_action_for_execution phase by modifiers (ex: increase damage dealth by double)
    p.finalDamageChange = 0 # flat damage amount shift to be applied after initial total is calculated. (ex: reduce all damage dealt to this unit by 2 - after damage boost / multiplier effects)
    p.totalDamageAmount = null # cached total damage amount once action has been executed (in case game state changes)

    return p

  getTotalDamageAmount: () ->
    if !@_private.totalDamageAmount?
      # apply 3 levels of damage change in order, but never allow damage amounts to go negative (that would be a heal)
      totalDamageAmount = Math.max(@getDamageAmount() + @getDamageChange(), 0) # apply initial flat damage change
      totalDamageAmount = Math.max(totalDamageAmount * @getDamageMultiplier(), 0) # apply damage multiplier
      totalDamageAmount = Math.max(totalDamageAmount + @getFinalDamageChange(), 0) # apply final flat damage change
      @_private.totalDamageAmount = Math.floor(totalDamageAmount) # floor the damage
    return @_private.totalDamageAmount

  # setters / getters
  getDamageAmount: () ->
    return @damageAmount

  setDamageAmount: (damageAmount) ->
    @damageAmount = Math.max(damageAmount, 0)
    @_private.totalDamageAmount = null

  getDamageChange: () ->
    return @_private.damageChange

  setDamageChange: (damageChange) ->
    @_private.damageChange = damageChange
    @_private.totalDamageAmount = null

  getFinalDamageChange: () ->
    return @_private.finalDamageChange

  setFinalDamageChange: (damageChange) ->
    @_private.finalDamageChange = damageChange
    @_private.totalDamageAmount = null

  getDamageMultiplier: () ->
    return @_private.damageMultiplier

  setDamageMultiplier: (damageMultiplier) ->
    @_private.damageMultiplier = damageMultiplier
    @_private.totalDamageAmount = null

  # convenience setters that take into account previous change values
  changeDamageBy: (damageChangeAmount) ->
    @setDamageChange(@getDamageChange() + damageChangeAmount)

  changeDamageMultiplierBy: (damageMultiplierChangeAmount) ->
    @setDamageMultiplier(@getDamageMultiplier() * damageMultiplierChangeAmount)

  changeFinalDamageBy: (finalDamageChangeAmount) ->
    @setFinalDamageChange(@getFinalDamageChange() + finalDamageChangeAmount)

  _execute: () ->
    super()

    source = @getSource()
    target = @getTarget()
    dmg = @getTotalDamageAmount()

    if target and target.getIsActive()
      # to do damage we need an active target with hp
      if target.getHP() > 0
        # do damage
        target.applyDamage(dmg)
        #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "#{@getType()}::execute - damage #{dmg} from #{source?.getLogName()} to #{target.getLogName()}. HP: #{target.getHP()} / #{target.getMaxHP()}".red

        # record total damage dealt so far by this player
        if source? and !source.isOwnedByGameSession()
          source.getOwner().totalDamageDealt += dmg

        if target.getIsGeneral()
          # Doesn't count damage to own general
          if source? and source.getOwnerId() != target.getOwnerId()
            source.getOwner()?.totalDamageDealtToGeneral += dmg

      # check if target is at zero hp
      if target.getHP() <= 0
        dieAction = target.actionDie(source)
        @getGameSession().executeAction(dieAction)

module.exports = DamageAction
