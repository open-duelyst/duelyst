Logger = require 'app/common/logger'
Action = require './action'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
PlayerModifier = require 'app/sdk/playerModifiers/playerModifier'
PlayerModifierBattlePetManager = require 'app/sdk/playerModifiers/playerModifierBattlePetManager'

class SwapGeneralAction extends Action

  @type:"SwapGeneralAction"
  isDepthFirst: true # swapping generals must be depth first to ensure general modifiers are preserved

  constructor: () ->
    @type ?= SwapGeneralAction.type
    super

  _execute: () ->
    super()

    source = @getSource()
    target = @getTarget()
    if source? and target?
      #Logger.module("SDK").debug("#{@getGameSession().gameId} SwapGeneralAction._execute -> swap from #{source.getLogName()} to #{target.getLogName()}")
      # get all modifiers on the current general that must move to the new general
      # remove any modifiers controlled by new general that were targeting the old general
      modifiersToMove = []
      for modifier in source.getModifiers() by -1
        parentModifier = modifier.getParentModifier()
        if modifier instanceof PlayerModifier or parentModifier instanceof ModifierCardControlledPlayerModifiers
          if parentModifier? and parentModifier.getCard() == target
            # remove any modifiers that are controlled by the new general
            if parentModifier instanceof ModifierCardControlledPlayerModifiers
              @getGameSession().removeModifier(parentModifier)
            else
              @getGameSession().removeModifier(modifier)
          else if modifier instanceof PlayerModifierBattlePetManager and target.hasModifierClass(PlayerModifierBattlePetManager)
            # don't move battle pet managers if target already has one (i.e. target is already a general)
            @getGameSession().removeModifier(modifier)
          else
            # move any modifiers that are uncontrolled
            # or controlled by units other than the new general
            modifiersToMove.unshift(modifier)

      # set new general
      @getGameSession().setEntityAsNewGeneral(target)

      # copy base General's signature card to new General
      target.setSignatureCardData(source.getBaseSignatureCardData())

      # reset the new general's event stream to ensure it reacts to events first
      target.startListeningToEvents()

      # move modifiers to new general
      for playerModifier in modifiersToMove
        @getGameSession().moveModifierToCard(playerModifier, target)

module.exports = SwapGeneralAction
