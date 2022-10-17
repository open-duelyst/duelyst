AttackAction =   require './attackAction'

class ForcedAttackAction extends AttackAction

  # An attack initiated automatically by a spell or effect
  # Does not count against normal attacks for the turn
  # DOES trigger strikeback, onAttack effects, etc
  # example usage: spell "all enemy minion nearby the enemy General attack it immediately"

  @type:"ForcedAttackAction"

  constructor: (gameSession) ->
    @type ?= ForcedAttackAction.type
    super(gameSession)

module.exports = ForcedAttackAction
