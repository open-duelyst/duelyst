Modifier = require './modifier'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierEnemySpellWatchFromHand extends Modifier

  type:"ModifierEnemySpellWatchFromHand"
  @type:"ModifierEnemySpellWatchFromHand"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  onBeforeAction: (e) ->
    super(e)

    action = e.action

    # watch for a spell (but not a followup) being cast by player who owns this entity
    if action instanceof PlayCardFromHandAction and action.getOwnerId() isnt @getCard().getOwnerId() and action.getCard()?.type is CardType.Spell
      @onEnemySpellWatchFromHand(action)

  onEnemySpellWatchFromHand: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierEnemySpellWatchFromHand
