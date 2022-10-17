Modifier = require './modifier'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CONFIG = require 'app/common/config'
ReplaceCardFromHandAction = require 'app/sdk/actions/replaceCardFromHandAction'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierSummonSelfOnReplace extends Modifier

  type:"ModifierSummonSelfOnReplace"
  @type:"ModifierSummonSelfOnReplace"

  @modifierName:"Summon Self On Replace"
  @description: "When you replace this card, summon it nearby.  Your General takes 2 damage"

  activeInHand: true
  activeInDeck: true
  activeInSignatureCards: false
  activeOnBoard: false

  fxResource: ["FX.Modifiers.ModifierBuffSelfOnReplace"]


  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.description
    else
      return @description

  onAction: (e) ->
    super(e)

    action = e.action

    # watch for my player replacing THIS card
    if action instanceof ReplaceCardFromHandAction and action.getOwnerId() is @getCard().getOwnerId()
      replacedCard = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(action.replacedCardIndex)
      if replacedCard is @getCard()
        # and play this card in a random space nearby owner's General
        general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
        generalPosition = general.getPosition()
        spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), generalPosition, CONFIG.PATTERN_3x3, @getCard(), @getCard())
        if spawnLocations.length > 0
          playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), spawnLocations[0].x, spawnLocations[0].y, @getCard().getIndex())
          @getGameSession().executeAction(playCardAction)
          # and damage own General for 2
          damageAction = new DamageAction(this.getGameSession())
          damageAction.setOwnerId(@getCard().getOwnerId())
          damageAction.setSource(@getCard())
          damageAction.setTarget(general)
          damageAction.setDamageAmount(2)
          @getGameSession().executeAction(damageAction)

module.exports = ModifierSummonSelfOnReplace
