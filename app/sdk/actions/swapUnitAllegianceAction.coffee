Logger = require 'app/common/logger'
Action = require './action'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
RefreshExhaustionAction =  require './refreshExhaustionAction'

class SwapUnitAllegianceAction extends Action

  @type: "SwapUnitAllegianceAction"

  constructor: () ->
    @type ?= SwapUnitAllegianceAction.type
    super

  _execute: () ->

    super()

    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SwapUnitAllegianceAction::execute"
    unit = @getTarget()

    if unit?
      # determine owners
      if unit.isOwnedByPlayer1()
        originalOwner = @getGameSession().getPlayer1()
        newOwner = @getGameSession().getPlayer2()
      else if unit.isOwnedByPlayer2()
        originalOwner = @getGameSession().getPlayer2()
        newOwner = @getGameSession().getPlayer1()

      wasGeneral = unit.getIsGeneral()
      if wasGeneral
        # set unit as no longer being a general
        @getGameSession().setEntityAsNotGeneral(unit)

      # set new owner
      unit.setOwner(newOwner)

      # exhaust the unit (summoning sickness)
      unit.applyExhaustion()

      # if unit was a rush minion, undo exhaustion
      if unit.hasActiveModifierClass(ModifierFirstBlood)
        refreshExhaustionAction = @getGameSession().createActionForType(RefreshExhaustionAction.type)
        refreshExhaustionAction.setSource(unit)
        refreshExhaustionAction.setTarget(unit)
        @getGameSession().executeAction(refreshExhaustionAction)

      for modifier in unit.getModifiers()
        if modifier?
          # notify modifier that its card has changed owners
          modifier.onChangeOwner(originalOwner.getPlayerId(), newOwner.getPlayerId())

          # if modifier is transforms during scrubbing
          # move modifier to the card it is already on
          # this will create an exact copy of the existing modifier
          # and the scrubbing systems will correctly transform the modifier based on the new owner
          if modifier.getTransformModifierTypeForScrubbing()?
            @getGameSession().moveModifierToCard(modifier, modifier.getCard())

      if wasGeneral and !@getGameSession().getGeneralForPlayer(originalOwner)?
        # notify the game session this entity was a general and has changed allegiance
        # so the original owner no longer has a general and the game is over
        @getGameSession().p_requestGameOver()

module.exports = SwapUnitAllegianceAction
