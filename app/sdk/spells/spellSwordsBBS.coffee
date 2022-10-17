Spell = require './spell'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
ModifierCannotBeReplaced = require 'app/sdk/modifiers/modifierCannotBeReplaced'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellSwordsBBS extends Spell

  spellsToGet = [
    {id: Cards.Spell.SpellSword1},
    {id: Cards.Spell.SpellSword2},
    {id: Cards.Spell.SpellSword3},
    {id: Cards.Spell.SpellSword4}
  ]

  onApplyOneEffectToBoard: (board, x, y, sourceAction) ->
    super(board, x, y, sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative()

      cardData = {}
      cardData.id = spellsToGet[@getGameSession().getRandomIntegerForExecution(spellsToGet.length)].id
      cardData.additionalModifiersContextObjects ?= []
      cardData.additionalModifiersContextObjects.push(ModifierCannotBeReplaced.createContextObject())
      a = new PutCardInHandAction(@getGameSession(), @getOwnerId(), cardData)
      @getGameSession().executeAction(a)

module.exports = SpellSwordsBBS
