ModifierOpeningGambit = require './modifierOpeningGambit'
PlayerModifierEndTurnWatchRevertBBS = require 'app/sdk/playerModifiers/playerModifierEndTurnWatchRevertBBS'

class ModifierOpeningGambitChangeSignatureCardForThisTurn extends ModifierOpeningGambit

  type:"ModifierOpeningGambitChangeSignatureCardForThisTurn"
  @type:"ModifierOpeningGambitChangeSignatureCardForThisTurn"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  cardData: null

  @createContextObject: (cardData) ->
    contextObject = super()
    contextObject.cardData = cardData
    return contextObject

  onOpeningGambit: (action) ->
    super(action)

    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

    #only add modifier to revert if one doesn't already exist, so we don't revert to a temp BBS
    if !general.hasActiveModifierClass(PlayerModifierEndTurnWatchRevertBBS)

      currentBBS = general.getSignatureCardData()
      revertBBSModifier = PlayerModifierEndTurnWatchRevertBBS.createContextObject(currentBBS)
      revertBBSModifier.durationEndTurn = 1
      @getGameSession().applyModifierContextObject(revertBBSModifier, general)

    general.setSignatureCardData(@cardData)
    @getGameSession().executeAction(general.getOwner().actionGenerateSignatureCard())

module.exports = ModifierOpeningGambitChangeSignatureCardForThisTurn
