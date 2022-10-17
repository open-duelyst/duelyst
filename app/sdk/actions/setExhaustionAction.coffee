Action = require './action'

class SetExhaustionAction extends Action

  @type:"SetExhaustionAction"

  exhausted: null
  movesMade: null
  attacksMade: null

  constructor: () ->
    @type ?= SetExhaustionAction.type
    super

  setExhausted: (val) ->
    @exhausted = val

  getExhausted: () ->
    return @exhausted

  setMovesMade: (val) ->
    @movesMade = val

  getMovesMade: () ->
    return @movesMade

  setAttacksMade: (val) ->
    @attacksMade = val

  getAttacksMade: () ->
    return @attacksMade

  _execute: () ->
    super()
    target = @getTarget()
    if target?
      # match new target's readiness state to that of original unit
      if @exhausted? then target.setExhausted(@exhausted)
      if @movesMade? then target.setMovesMade(@movesMade)
      if @attacksMade? then target.setAttacksMade(@attacksMade)

module.exports = SetExhaustionAction
