Modifier = require './modifier'
ModifierSummonWatchByCardBuffTarget = require './modifierSummonWatchByCardBuffTarget'

class ModifierSummonWatchDreadnaught extends ModifierSummonWatchByCardBuffTarget

  type:"ModifierSummonWatchDreadnaught"
  @type:"ModifierSummonWatchDreadnaught"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  @description: "%X you summon %Y"
  validCardIds: null # array of card IDs to watch for

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = @description.replace /%X/, modifierContextObject.cardDescription
      return replaceText.replace /%Y/, modifierContextObject.buffDescription
    else
      return @description

  getIsCardRelevantToWatcher: (card) ->
    return card.getAppliedToBoardByAction()?.getSource() isnt @getCard() and super(card)

module.exports = ModifierSummonWatchDreadnaught
