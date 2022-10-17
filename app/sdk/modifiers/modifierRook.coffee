Modifier = require './modifier'
ModifierEndTurnWatch = require './modifierEndTurnWatch'
CardType = require 'app/sdk/cards/cardType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierBlastAttack = require './modifierBlastAttack'
ModifierBackstab = require './modifierBackstab'
ModifierInfiltrate = require './modifierInfiltrate'
ModifierGrow = require './modifierGrow'
ModifierBandingHealSelfAndGeneral = require './modifierBandingHealSelfAndGeneral'
ModifierDeathWatchDrawToXCards = require './modifierDeathWatchDrawToXCards'
i18next = require 'i18next'

class ModifierRook extends ModifierEndTurnWatch

  type:"ModifierRook"
  @type:"ModifierRook"

  @description: "At the end of your turn, this minion gains a random Faction ability"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: () ->
    contextObject = super()
    contextObject.allModifierContextObjects = [
      ModifierBlastAttack.createContextObject(),
      ModifierBackstab.createContextObject(5),
      ModifierInfiltrate.createContextObject([
        Modifier.createContextObjectWithAttributeBuffs(5, 0, {appliedName: i18next.t("modifiers.rook_infiltrate_name")})
      ], i18next.t("modifiers.rook_infiltrate_def")),
      ModifierGrow.createContextObject(5),
      ModifierBandingHealSelfAndGeneral.createContextObject(5)
      ModifierDeathWatchDrawToXCards.createContextObject(5)
    ]
    return contextObject

  onTurnWatch: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative() and @allModifierContextObjects.length > 0
      # pick one modifier from the remaining list and splice it out of the set of choices
      modifierContextObject = @allModifierContextObjects.splice(@getGameSession().getRandomIntegerForExecution(@allModifierContextObjects.length), 1)[0]
      @getGameSession().applyModifierContextObject(modifierContextObject, @getCard())

module.exports = ModifierRook
