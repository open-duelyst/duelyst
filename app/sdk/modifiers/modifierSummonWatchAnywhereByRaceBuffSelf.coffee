ModifierSummonWatchByRaceBuffSelf = require './modifierSummonWatchByRaceBuffSelf'

class ModifierSummonWatchAnywhereByRaceBuffSelf extends ModifierSummonWatchByRaceBuffSelf

  type:"ModifierSummonWatchAnywhereByRaceBuffSelf"
  @type:"ModifierSummonWatchAnywhereByRaceBuffSelf"

  activeInHand: true
  activeInDeck: true
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  onActivate: () ->
    # special check on activation in case this card is created mid-game
    # need to check all actions that occured this gamesession for triggers
    summonMinionActions = @getGameSession().filterActions(@getIsActionRelevant.bind(@))
    for action in summonMinionActions
      if @getIsCardRelevantToWatcher(action.getCard()) and action.getCard() isnt @getCard()
        @onSummonWatch(action)

module.exports = ModifierSummonWatchAnywhereByRaceBuffSelf
