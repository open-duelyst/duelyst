Modifier = require './modifier'
ModifierOpeningGambit = require './modifierOpeningGambit'
CardType = require 'app/sdk/cards/cardType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierFrenzy = require './modifierFrenzy'
ModifierFlying = require './modifierFlying'
ModifierTranscendance = require './modifierTranscendance'
ModifierProvoke = require './modifierProvoke'
ModifierRanged = require './modifierRanged'
ModifierFirstBlood = require './modifierFirstBlood'
ModifierRebirth = require './modifierRebirth'
ModifierBlastAttack = require './modifierBlastAttack'

class ModifierElkowl extends ModifierOpeningGambit

  type:"ModifierElkowl"
  @type:"ModifierElkowl"

  @description: "Gain two random abilities"

  @createContextObject: () ->
    contextObject = super()
    contextObject.allModifierContextObjects = [
      ModifierFrenzy.createContextObject(),
      ModifierFlying.createContextObject(),
      ModifierTranscendance.createContextObject(),
      ModifierProvoke.createContextObject(),
      ModifierRanged.createContextObject(),
      ModifierFirstBlood.createContextObject(),
      ModifierRebirth.createContextObject(),
      ModifierBlastAttack.createContextObject()
    ]
    return contextObject

  fxResource: ["FX.Modifiers.ModifierGenericBuff"]

  onOpeningGambit: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      # pick two unique modifiers from the list
      modifierContextObject = @allModifierContextObjects.splice(@getGameSession().getRandomIntegerForExecution(@allModifierContextObjects.length), 1)[0]
      @getGameSession().applyModifierContextObject(modifierContextObject, @getCard())
      modifierContextObject2 = @allModifierContextObjects.splice(@getGameSession().getRandomIntegerForExecution(@allModifierContextObjects.length), 1)[0]
      @getGameSession().applyModifierContextObject(modifierContextObject2, @getCard())

module.exports = ModifierElkowl
