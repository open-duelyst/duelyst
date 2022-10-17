Modifier = require './modifier'
DieAction = require 'app/sdk/actions/dieAction'
DamageAction = require 'app/sdk/actions/damageAction'
Stringifiers = require 'app/sdk/helpers/stringifiers'
i18next = require 'i18next'

class ModifierSecondWind extends Modifier

  type:"ModifierSecondWind"
  @type:"ModifierSecondWind"

  @modifierName:i18next.t("modifiers.second_wind_name")
  @description:i18next.t("modifiers.second_wind_def")

  activeInDeck: false
  activeInHand: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  fxResource: ["FX.Modifiers.ModifierSecondWind"]

  @createContextObject: (attackBuff=0, maxHPBuff=0, buffsAreRemovable=true, buffAppliedName=undefined, buffAppliedDescription=null, options) ->
    contextObject = super(options)
    buffAppliedDescription ?= Stringifiers.stringifyAttackHealthBuff(attackBuff,maxHPBuff)
    contextObject.modifiersContextObjects = [
      Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff,{
        modifierName:@modifierName,
        appliedName:buffAppliedName,
        appliedDescription:buffAppliedDescription,
        resetsDamage: true,
        isRemovable:buffsAreRemovable
      })
    ]
    return contextObject

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.secondWindAtActionIndex = -1 # index of action triggering second wind

    return p

  onAfterCleanupAction: (event) ->
    super(event)

    action = event.action

    if @getGameSession().getIsRunningAsAuthoritative() and @_private.secondWindAtActionIndex == action.getIndex()
      # after cleaning up action, trigger second wind
      @onSecondWind(action)

      # make sure to remove self to prevent triggering second wind again
      @getGameSession().removeModifier(@)

  onValidateAction: (event) ->
    super(event)

    action = event.action

    # when our entity would die, invalidate the action until second wind executes
    if action instanceof DieAction and action.getTarget() is @getCard() and action.getParentAction() instanceof DamageAction
      # record index of parent action of die action, so we know when to trigger second wind
      @_private.secondWindAtActionIndex = action.getParentAction().getIndex()
      @invalidateAction(action, @getCard().getPosition(), @getCard().getName() + " finds a second wind and avoids death!")

  onSecondWind: (action) ->
    # silence self to remove all existing buffs/debuffs
    # set this modifier as not removable until we complete second wind
    @isRemovable = false
    @getCard().silence()

    # apply buffs
    modifiersContextObjects = @modifiersContextObjects
    if modifiersContextObjects? and modifiersContextObjects.length > 0
      for modifierContextObject in modifiersContextObjects
        @getGameSession().applyModifierContextObject(modifierContextObject, @getCard())

module.exports = ModifierSecondWind
