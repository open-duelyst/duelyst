ModifierEnemySpellWatch = require './modifierEnemySpellWatch'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierEnemySpellWatchPutCardInHand extends ModifierEnemySpellWatch

  type:"ModifierEnemySpellWatchPutCardInHand"
  @type:"ModifierEnemySpellWatchPutCardInHand"

  @modifierName:"Enemy Spell Watch Put Card In Hand"
  @description: "Whenever the opponent casts a spell, put an X in your action bar"

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  @createContextObject: (cardDataOrIndexToPutInHand, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToPutInHand = cardDataOrIndexToPutInHand
    return contextObject

  onEnemySpellWatch: (action) ->
    a = new PutCardInHandAction(this.getGameSession(), @getCard().getOwnerId(), @cardDataOrIndexToPutInHand)
    this.getGameSession().executeAction(a)

module.exports = ModifierEnemySpellWatchPutCardInHand
