CONFIG = require 'app/common/config'
Modifier = require 'app/sdk/modifiers/modifier'
MoveAction = require 'app/sdk/actions/moveAction.coffee'
AttackAction =   require 'app/sdk/actions/attackAction.coffee'
CardType = require 'app/sdk/cards/cardType.coffee'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
ModifierImmuneToAttacks = require 'app/sdk/modifiers/modifierImmuneToAttacks'
ModifierImmuneToAttacksByGeneral = require 'app/sdk/modifiers/modifierImmuneToAttacksByGeneral'
ModifierImmuneToAttacksByRanged = require 'app/sdk/modifiers/modifierImmuneToAttacksByRanged'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'
ModifierBlastAttack = require 'app/sdk/modifiers/modifierBlastAttack'
ModifierCannotAttackGeneral = require 'app/sdk/modifiers/modifierCannotAttackGeneral'
_ = require 'underscore'

i18next = require('i18next')

class ModifierBattlePet extends Modifier

  type: "ModifierBattlePet"
  @type: "ModifierBattlePet"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.battle_pet_def")

  @modifierName:i18next.t("modifiers.battle_pet_name")
  @description: ""
  @isHiddenToUI: true

  maxStacks: 1
  isRemovable: false

  activeInHand: false
  activeInDeck: false
  activeOnBoard: true

  generateActions: () ->
    battlePetDesiredActions = []

    # if battle pet is stunned, don't try to act
    if @getCard().hasModifierClass(ModifierStunned)
      return battlePetDesiredActions

    # get starting position
    attackFromPosition = @getCard().getPosition()

    # check whether battle pet can attack
    canAttack = @getCard().getCanAttack()

    if canAttack
      # find attackable targets in melee range
      validAttackTargets = @findAttackableTargetsAroundPosition(attackFromPosition, true)

    # if any enemies can be attacked within melee range without moving, pick one and attack
    if validAttackTargets? and validAttackTargets.length > 0
      target = validAttackTargets[@getGameSession().getRandomIntegerForExecution(validAttackTargets.length)]
      attackAction = @getCard().actionAttack(target)
      attackAction.setIsAutomatic(true)
      battlePetDesiredActions.push(attackAction)
    else if !@getCard().getIsProvoked()
      # couldn't find a valid target without moving
      if @getCard().getCanMove()
        # move towards closest attackable target
        validMovePositions = []
        for movePath in @getCard().getMovementRange().getValidPositions(@getGameSession().getBoard(), @getCard())
          for moveLocation in movePath
            validMovePositions.push(moveLocation)
        if validMovePositions.length > 0
          validMovePositions = UtilsPosition.getUniquePositions(validMovePositions)
          attackFromPosition = @chooseAggressivePosition(validMovePositions)
          moveAction = @getCard().actionMove(attackFromPosition)
          moveAction.setIsAutomatic(true)
          battlePetDesiredActions.push(moveAction)

      if canAttack
        # find attackable targets in full attack range
        validAttackTargets = @findAttackableTargetsAroundPosition(attackFromPosition, false)

        # if we found any enemies to attack, pick one and attack now
        if validAttackTargets.length > 0
          target = validAttackTargets[@getGameSession().getRandomIntegerForExecution(validAttackTargets.length)]
          attackAction = @getCard().actionAttack(target)
          # this attack will actually happen from where this unit is about to move to NOT where the unit is located when the attack action is created
          attackAction.setSourcePosition(attackFromPosition)
          attackAction.setIsAutomatic(true)
          battlePetDesiredActions.push(attackAction)
    return battlePetDesiredActions

  findAttackableTargetsAroundPosition:(position, meleeOnly) ->
    forRanged = @getCard().hasActiveModifierClass(ModifierRanged)
    forGeneral = @getCard().getIsGeneral()
    forBlast = @getCard().hasActiveModifierClass(ModifierBlastAttack)
    potentialAttackTargets = []

    # find potential targets
    if forRanged
      potentialAttackTargets = @getGameSession().getBoard().getUnits()
    else
      potentialAttackTargets = @getGameSession().getBoard().getCardsAroundPosition(position, CardType.Unit, 1)

    if forBlast #finally we'll add targets that can be hit by blast to the previously found potential targets
      unitsInRow = @getGameSession().getBoard().getEntitiesInRow(position.y, CardType.Unit)
      unitsInCol = @getGameSession().getBoard().getEntitiesInColumn(position.x, CardType.Unit)
      potentialAttackTargets = potentialAttackTargets.concat(unitsInRow)
      potentialAttackTargets = potentialAttackTargets.concat(unitsInCol)
      potentialAttackTargets = _.uniq(potentialAttackTargets)

    # find all potential attackable targets
    validAttackTargets = []
    foundRangedProvoker = false
    foundProvoker = false
    for unit in potentialAttackTargets
      if @getIsTargetAttackable(unit, forRanged, forGeneral)
        # check for provokers
        if forRanged and unit.getIsRangedProvoker()
          if !foundRangedProvoker then validAttackTargets.length = 0
          foundRangedProvoker = true
          validAttackTargets.push(unit)
        else if unit.getIsProvoker() and (Math.abs(unit.getPositionX() - position.x) <= 1 and Math.abs(unit.getPositionY() - position.y) <= 1)
          if !foundProvoker then validAttackTargets.length = 0
          foundProvoker = true
          validAttackTargets.push(unit)
        else if !foundProvoker and !foundRangedProvoker and (!meleeOnly or (Math.abs(unit.getPositionX() - position.x) <= 1 and Math.abs(unit.getPositionY() - position.y) <= 1))
          validAttackTargets.push(unit)

    # now that we've filtered targets that we can actually attack, pick the best one
    return @getBestTargetUnitsfromPosition(position, validAttackTargets)

  getIsTargetAttackable: (target, forRanged, forGeneral) ->
    attackable = !target.getIsSameTeamAs(@getCard()) and
      target.getHP() > 0 and
      (!target.getIsGeneral() or
        !@getCard().hasActiveModifierClass(ModifierCannotAttackGeneral))
    if attackable
      # immunity
      for modifier in target.getModifiers()
        if modifier.getIsActive()
          # attack immunity
          if modifier instanceof ModifierImmuneToAttacks
            if modifier instanceof ModifierImmuneToAttacksByRanged
              if forRanged
                attackable = false
                break
            else if modifier instanceof ModifierImmuneToAttacksByGeneral
              if forGeneral
                attackable = false
                break
            else
              attackable = false
              break

    return attackable

  getBestTargetUnitsfromPosition: (position, validTargets) ->
    closestUnits = []
    # find the closest position to the desired position that this minion can actually attack
    bestAbsoluteDistance = 9999
    for unit in validTargets
      targetPosition = unit.getPosition()
      absoluteDistance = Math.abs(targetPosition.x - position.x) + Math.abs(targetPosition.y - position.y)
      # found a new best target position
      if absoluteDistance < bestAbsoluteDistance
        bestAbsoluteDistance = absoluteDistance
        closestUnits = [] # reset potential targets
        closestUnits.push(unit)
      #found an equally good target position
      else if absoluteDistance == bestAbsoluteDistance
        closestUnits.push(unit)
    return closestUnits

  chooseAggressivePosition:(positions) ->
    closestPositions = []
    forRanged = @getCard().hasActiveModifierClass(ModifierRanged)
    forGeneral = @getCard().getIsGeneral()

    # find the closest enemy this minion can move to and melee
    bestAbsoluteDistance = 9999
    for position in positions # check each position this unit could move to
      if !@getGameSession().getBoard().getUnitAtPosition(position) # if position is not obstructed
        # check for enemies within melee range of this position
        enemyFound = false
        for card in @getGameSession().getBoard().getCardsAroundPosition(position, CardType.Unit, 1)
          if @getIsTargetAttackable(card, forRanged, forGeneral)
            enemyFound = true
            absoluteDistance = Math.abs(@getCard().position.x - position.x) + Math.abs(@getCard().position.y - position.y)
            # found a new best target position
            if absoluteDistance < bestAbsoluteDistance
              bestAbsoluteDistance = absoluteDistance
              closestPositions.length = 0 # reset potential target positions
              closestPositions.push(position)
            #found an equally good target position
            else if absoluteDistance == bestAbsoluteDistance
              closestPositions.push(position)

    if closestPositions.length == 0 # haven't found any enemies we can move towards and melee, then just move towards the closest enemy
      for position in positions
        if !@getGameSession().getBoard().getUnitAtPosition(position) # if position is not obstructed
          for potentialTarget in @getGameSession().getBoard().getEnemyEntitiesForEntity(@getCard(), CardType.Unit)
            absoluteDistance = Math.abs(potentialTarget.position.x - position.x) + Math.abs(potentialTarget.position.y - position.y)
            # found a new best target position
            if absoluteDistance < bestAbsoluteDistance
              bestAbsoluteDistance = absoluteDistance
              closestPositions.length = 0 # reset potential target positions
              closestPositions.push(position)
              #found an equally good target position
            else if absoluteDistance == bestAbsoluteDistance
              closestPositions.push(position)

    # pick a random position
    return closestPositions[@getGameSession().getRandomIntegerForExecution(closestPositions.length)]

  onValidateAction:(actionEvent) ->
    a = actionEvent.action
    if a.getIsValid()
      card = @getCard()
      # cannot explicitly move or attack with battle pets UNLESS they are being modified to be player controllable
      if card? and card is a.getSource() and card.getIsUncontrollableBattlePet() and (a instanceof MoveAction or a instanceof AttackAction) and !a.getIsAutomatic() and !a.getIsImplicit()
        @invalidateAction(a, card.getPosition(), i18next.t("modifiers.battle_pet_error"))

module.exports = ModifierBattlePet
