ModifierEndTurnWatch = require './modifierEndTurnWatch'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'

class ModifierEndTurnWatchGainLastSpellPlayedThisTurn extends ModifierEndTurnWatch

  type:"ModifierEndTurnWatchGainLastSpellPlayedThisTurn"
  @type:"ModifierEndTurnWatchGainLastSpellPlayedThisTurn"

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch"]

  onTurnWatch: (action) ->

    actions = []
    lastSpell = null
    for step in @getGameSession().getCurrentTurn().getSteps()
      actions = actions.concat(step.getAction().getFlattenedActionTree())
    for action in actions by -1
      if action instanceof ApplyCardToBoardAction and
      action.getCard()?.getRootCard()?.getType() is CardType.Spell and
      action.getCard().getRootCard() is action.getCard() and
      !action.getIsImplicit() and
      action.getOwnerId() is @getOwnerId()
        lastSpell = action.getCard()
        break

    if lastSpell?
      # put fresh copy of spell into hand
      putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), lastSpell.createNewCardData())
      @getGameSession().executeAction(putCardInHandAction)

module.exports = ModifierEndTurnWatchGainLastSpellPlayedThisTurn
