Modifier = require './modifier'
ModifierDrawCardWatch = require './modifierDrawCardWatch'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierDrawCardWatchCopySpell extends ModifierDrawCardWatch

  type:"ModifierDrawCardWatchCopySpell"
  @type:"ModifierDrawCardWatchCopySpell"

  @modifierName:"Draw Card Watch"
  @description: "Whenever you draw a spell, put another copy of it in your Action Bar"

  fxResource: ["FX.Modifiers.ModifierDrawCardWatch"]

  onDrawCardWatch: (action) ->
    if action.getCard()?.getType() is CardType.Spell
      a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), action.getCard().createCloneCardData() )
      @getGameSession().executeAction(a)

module.exports = ModifierDrawCardWatchCopySpell
