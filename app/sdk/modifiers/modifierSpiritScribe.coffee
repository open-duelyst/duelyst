Modifier = require './modifier'
ModifierSummonWatch = require './modifierSummonWatch'
CardType = require 'app/sdk/cards/cardType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierFrenzy = require './modifierFrenzy'
ModifierFlying = require './modifierFlying'
ModifierTranscendance = require './modifierTranscendance'
ModifierProvoke = require './modifierProvoke'
ModifierRanged = require './modifierRanged'

class ModifierSpiritScribe extends ModifierSummonWatch

  type:"ModifierSpiritScribe"
  @type:"ModifierSpiritScribe"

  @description: "Whenever you summon a minion, this minion gains a random keyword ability"

  @createContextObject: () ->
    contextObject = super()
    contextObject.allModifierContextObjects = [
      ModifierFrenzy.createContextObject(),
      ModifierFlying.createContextObject(),
      ModifierTranscendance.createContextObject(),
      ModifierProvoke.createContextObject(),
      ModifierRanged.createContextObject()
    ]
    return contextObject

  fxResource: ["FX.Modifiers.ModifierGenericBuff"]

  onSummonWatch: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative() and @allModifierContextObjects.length > 0
      # pick one modifier from the remaining list and splice it out of the set of choices
      modifierContextObject = @allModifierContextObjects.splice(@getGameSession().getRandomIntegerForExecution(@allModifierContextObjects.length), 1)[0]
      @getGameSession().applyModifierContextObject(modifierContextObject, @getCard())

module.exports = ModifierSpiritScribe
