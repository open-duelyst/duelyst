ModifierOpponentDrawCardWatch = require './modifierOpponentDrawCardWatch'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierBlastAttack = require 'app/sdk/modifiers/modifierBlastAttack'

class ModifierOpponentDrawCardWatchGainKeyword extends ModifierOpponentDrawCardWatch

  type:"ModifierOpponentDrawCardWatchGainKeyword"
  @type:"ModifierOpponentDrawCardWatchGainKeyword"

  @modifierName:"ModifierOpponentDrawCardWatchGainKeyword"
  @description: "Whenever your opponent draws a card, this minion gains a random ability."

  allModifierContextObjects = []

  @createContextObject: () ->
    contextObject = super()
    contextObject.allModifierContextObjects = [
      ModifierFrenzy.createContextObject(),
      ModifierFlying.createContextObject(),
      ModifierTranscendance.createContextObject(),
      ModifierProvoke.createContextObject(),
      ModifierBlastAttack.createContextObject()
    ]
    return contextObject

  onDrawCardWatch: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative() and @allModifierContextObjects.length > 0
      # pick one modifier from the remaining list and splice it out of the set of choices
      modifierContextObject = @allModifierContextObjects.splice(@getGameSession().getRandomIntegerForExecution(@allModifierContextObjects.length), 1)[0]
      @getGameSession().applyModifierContextObject(modifierContextObject, @getCard())

module.exports = ModifierOpponentDrawCardWatchGainKeyword