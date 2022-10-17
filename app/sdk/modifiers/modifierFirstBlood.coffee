Modifier = require './modifier'
RefreshExhaustionAction =  require 'app/sdk/actions/refreshExhaustionAction'
ApplyExhaustionAction =  require 'app/sdk/actions/applyExhaustionAction'

i18next = require('i18next')

class ModifierFirstBlood extends Modifier

  type:"ModifierFirstBlood"
  @type:"ModifierFirstBlood"

  @isKeyworded: true
  @keywordDefinition:i18next.t("modifiers.rush_def")
  maxStacks: 1

  @modifierName:i18next.t("modifiers.rush_name")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierFirstBlood"]

  onActivate: ()  ->
    super()
    # if rush is applied on the turn that the unit was summoned
    if @getGameSession().wasActionExecutedDuringTurn(@getCard().getAppliedToBoardByAction(), @getGameSession().getCurrentTurn()) and @getGameSession().getCanCardBeScheduledForRemoval(@getCard())
      # immediately activate the unit IF it has not already moved and / or attacked this turn (do not re-activate units that already had rush)
      if @getCard().getMovesMade() == 0 and @getCard().getAttacksMade() == 0
        refreshExhaustionAction = @getGameSession().createActionForType(RefreshExhaustionAction.type)
        refreshExhaustionAction.setSource(@getCard())
        refreshExhaustionAction.setTarget(@getCard())
        @getCard().getGameSession().executeAction(refreshExhaustionAction)

  deactivateRushIfNeeded: ()  ->
    # if rush is dispelled, deactivated, or removed on the turn that the unit was summoned
    # immediately exhaust the unit
    if @getGameSession().wasActionExecutedDuringTurn(@getCard()?.getAppliedToBoardByAction(), @getGameSession().getCurrentTurn()) and @getGameSession().getCanCardBeScheduledForRemoval(@getCard())
      applyExhaustionAction = @getGameSession().createActionForType(ApplyExhaustionAction.type)
      applyExhaustionAction.setSource(@getCard())
      applyExhaustionAction.setTarget(@getCard())
      @getGameSession().executeAction(applyExhaustionAction)

  onDeactivate: () ->
    super()
    @deactivateRushIfNeeded()

  onRemoveFromCard: () ->
    super()
    @deactivateRushIfNeeded()


module.exports = ModifierFirstBlood
