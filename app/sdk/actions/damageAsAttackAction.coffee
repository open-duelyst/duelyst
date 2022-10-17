DamageAction =     require './damageAction'

###
  Damage action that looks like an attack but is not a true attack.
###
class DamageAsAttackAction extends DamageAction

  @type:"DamageAsAttackAction"
  damageAmount: 0 # base damage amount, should be set when action first made and then never modified

  constructor: (gameSession) ->
    @type ?= DamageAsAttackAction.type
    super(gameSession)

  getDamageAmount: () ->
    # attack damage amount is always source's atk value
    source = @getSource()
    if source? then return source.getATK() else return 0

module.exports = DamageAsAttackAction
