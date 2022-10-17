Modifier = require './modifier'
ModifierSummonWatch = require './modifierSummonWatch'

class ModifierSummonWatchByCardBuffTarget extends ModifierSummonWatch

  type:"ModifierSummonWatchByCardBuffTarget"
  @type:"ModifierSummonWatchByCardBuffTarget"

  @modifierName:"Summon Watch (buff by card Id)"
  @description: "Whenever you summon %X, %Y"
  validCardIds: null # array of card IDs to watch for

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modContextObject, validCardIds, cardDescription, buffDescription, options=undefined) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modContextObject
    contextObject.validCardIds = validCardIds
    contextObject.cardDescription = cardDescription
    contextObject.buffDescription = buffDescription
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = @description.replace /%X/, modifierContextObject.cardDescription
      return replaceText.replace /%Y/, modifierContextObject.buffDescription
    else
      return @description

  onSummonWatch: (action) ->
    entity = action.getCard()
    if entity?
      for modifierContextObject in @modifiersContextObjects
        @getGameSession().applyModifierContextObject(modifierContextObject, entity)

  getIsCardRelevantToWatcher: (card) ->
    return card.getBaseCardId() in @validCardIds # card is in list of cards we want to buff

module.exports = ModifierSummonWatchByCardBuffTarget
