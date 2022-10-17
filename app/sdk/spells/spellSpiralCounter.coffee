SpellDamage = require './spellDamage'
CardType = require 'app/sdk/cards/cardType'
AttackAction = require 'app/sdk/actions/attackAction'

class SpellSpiralCounter extends SpellDamage

  damageAmount: 8

  # can only target enemy minions that attacked last turn
  _filterPlayPositions: (spellPositions) ->

    finalPositions = []

    turns = @getGameSession().getTurns()
    if turns.length > 1
      lastTurn = turns[turns.length-1]
      actions = []
      possibleTargets = []

      for step in lastTurn.getSteps()
        actions = actions.concat(step.getAction().getFlattenedActionTree())

      # find enemy minions that attacked last turn
      for action in actions
        if action.type is AttackAction.type
          attacker = action.getSource()
          if attacker.getType() is CardType.Unit and !(attacker.getOwnerId() is @getOwnerId()) and !attacker.getIsGeneral()
            possibleTargets.push(attacker)

      for target in possibleTargets
        if target.getIsLocatedOnBoard()
          finalPositions.push(target.getPosition())

    return finalPositions

module.exports = SpellSpiralCounter
