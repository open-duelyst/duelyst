EVENTS = require 'app/common/event_types'
Modifier = require './modifier'
ModifierQuestBuffAbyssian = require './modifierQuestBuffAbyssian'
ModifierQuestBuffNeutral = require './modifierQuestBuffNeutral'
ModifierQuestBuffVanar = require './modifierQuestBuffVanar'
PlayerModifierEmblem = require 'app/sdk/playerModifiers/playerModifierEmblem'
SwapGeneralAction = require 'app/sdk/actions/swapGeneralAction'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

class ModifierBackupGeneral extends Modifier

  type:"ModifierBackupGeneral"
  @type:"ModifierBackupGeneral"

  @description: ""

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.validate_game_over
        @_onValidateGameOver(event)

  _onValidateGameOver: (event) ->
    if @getGameSession().getIsRunningAsAuthoritative() and @_private.cachedIsActive
      # find general
      general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
      if general? and general.getIsRemoved()
        # check for backup generals
        activeUnits = @getGameSession().getBoard().getFriendlyEntitiesForEntity(general, CardType.Unit)
        backupGenerals = []
        for unit in activeUnits
          if !unit.getIsGeneral() and unit.getIsActive() and unit.getIsSameTeamAs(general) and unit.hasActiveModifierClass(ModifierBackupGeneral)
            backupGenerals.push(unit)

        if backupGenerals.length > 0
          # choose one backup general at random
          backupGeneral = backupGenerals[@getGameSession().getRandomIntegerForExecution(backupGenerals.length)]
          backupGeneralModifier = backupGeneral.getModifierByClass(ModifierBackupGeneral)

          # set backup general modifier as triggering
          @getGameSession().pushTriggeringModifierOntoStack(backupGeneralModifier)

          # remove backup general modifiers from new general
          for modifier in backupGeneral.getModifiersByClass(ModifierBackupGeneral)
            @getGameSession().removeModifier(modifier)

          # remove modifiers applied from existing emblems
          for modifier in backupGeneral.getModifiers()
            if modifier?
              if modifier instanceof ModifierQuestBuffAbyssian or modifier instanceof ModifierQuestBuffNeutral or modifier instanceof ModifierQuestBuffVanar
                @getGameSession().removeModifier(modifier)

          # swap generals with depth first action
          # so the swap can take place before anything else reacts
          swapGeneralAction = new SwapGeneralAction(@getGameSession())
          swapGeneralAction.setIsDepthFirst(true)
          swapGeneralAction.setSource(general)
          swapGeneralAction.setTarget(backupGeneral)
          @getGameSession().executeAction(swapGeneralAction)

          # stop triggering backup general modifier
          @getGameSession().popTriggeringModifierFromStack()

module.exports = ModifierBackupGeneral
