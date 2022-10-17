Modifier = require './modifier'
ModifierEnemySpellWatch = require './modifierEnemySpellWatch'
CardType = require 'app/sdk/cards/cardType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierFrenzy = require './modifierFrenzy'
ModifierFlying = require './modifierFlying'
ModifierTranscendance = require './modifierTranscendance'
ModifierProvoke = require './modifierProvoke'
ModifierRanged = require './modifierRanged'
ModifierForcefield = require './modifierForcefield'
ModifierBlastAttack = require './modifierBlastAttack'
ModifierGrow = require './modifierGrow'
ModifierFirstBlood = require './modifierFirstBlood'
ModifierBackstab = require './modifierBackstab'

class ModifierSpellWatchGainRandomKeyword extends ModifierEnemySpellWatch

  type:"ModifierSpellWatchGainRandomKeyword"
  @type:"ModifierSpellWatchGainRandomKeyword"

  @description: "Whenever you cast a spell, this gains a random keyword ability"

  @createContextObject: () ->
    contextObject = super()
    contextObject.allModifierContextObjects = [
      ModifierFrenzy.createContextObject(),
      ModifierFlying.createContextObject(),
      ModifierTranscendance.createContextObject(),
      ModifierProvoke.createContextObject(),
      ModifierRanged.createContextObject(),
      ModifierBlastAttack.createContextObject(),
      ModifierForcefield.createContextObject(),
      ModifierGrow.createContextObject(2),
      ModifierFirstBlood.createContextObject(),
      ModifierBackstab.createContextObject(2)
    ]
    return contextObject

  fxResource: ["FX.Modifiers.ModifierGenericBuff"]

  onEnemySpellWatch: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative() and @allModifierContextObjects.length > 0
      # pick one modifier from the remaining list and splice it out of the set of choices
      modifierContextObject = @allModifierContextObjects.splice(@getGameSession().getRandomIntegerForExecution(@allModifierContextObjects.length), 1)[0]
      @getGameSession().applyModifierContextObject(modifierContextObject, @getCard())

module.exports = ModifierSpellWatchGainRandomKeyword
