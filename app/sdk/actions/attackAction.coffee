CONFIG =     require 'app/common/config'
DamageAction =   require './damageAction'
CardType =       require 'app/sdk/cards/cardType'
_ = require 'underscore'

class AttackAction extends DamageAction

  @type:"AttackAction"

  constructor: (gameSession) ->
    @type ?= AttackAction.type
    super(gameSession)

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    # cache
    p.isStrikebackAllowed = true # normally target of attack actions will strike back, but in some cases strike back should be supressed

    return p

  getDamageAmount: () ->
    # attack damage amount is always source's atk value
    source = @getSource()
    if source? then return source.getATK() else return 0

  setDamageAmount: () ->
    # does nothing for attacks

  setIsStrikebackAllowed: (isStrikebackAllowed) ->
    @_private.isStrikebackAllowed = isStrikebackAllowed

  getIsStrikebackAllowed: () ->
    return @_private.isStrikebackAllowed

  _execute: () ->

    super()

    attacker = @getSource()

    if attacker?
      if !@getIsImplicit() then attacker.setAttacksMade(attacker.getAttacksMade() + 1)

module.exports = AttackAction
