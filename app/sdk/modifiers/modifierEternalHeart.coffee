Modifier = require './modifier'
DieAction = require 'app/sdk/actions/dieAction'
SetDamageAction = require 'app/sdk/actions/setDamageAction'
i18next = require 'i18next'

class ModifierEternalHeart extends Modifier

  type:"ModifierEternalHeart"
  @type:"ModifierEternalHeart"

  @modifierName:"Eternal Heart"
  @description: "Can't die"

  activeInDeck: false
  activeInHand: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  fxResource: ["FX.Modifiers.EternalHeart"]

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.eternalHeartAtActionIndexActionIndex = -1 # index of action triggering eternal heart

    return p

  onAfterCleanupAction: (event) ->
    super(event)

    action = event.action
    if @getGameSession().getIsRunningAsAuthoritative() and @_private.eternalHeartAtActionIndexActionIndex == action.getIndex()
      # after cleaning up action, set HP to 1
      setDamageAction = new SetDamageAction(@getGameSession())
      setDamageAction.setOwnerId(@getOwnerId())
      setDamageAction.setTarget(@getCard())
      setDamageAction.damageValue = @getCard().getMaxHP() - 1
      @getGameSession().executeAction(setDamageAction)


  onValidateAction: (event) ->
    super(event)

    action = event.action

    # when this would die, invalidate the death
    if action instanceof DieAction and action.getTarget() is @getCard()
      # record index of parent action of die action, so we know when to trigger eternal heart
      if action.getParentAction()?
        @_private.eternalHeartAtActionIndexActionIndex = action.getParentActionIndex()
      else
        @_private.eternalHeartAtActionIndexActionIndex = action.getIndex()
      @invalidateAction(action, @getCard().getPosition(), i18next.t("modifiers.eternal_heart_error"))


module.exports = ModifierEternalHeart
