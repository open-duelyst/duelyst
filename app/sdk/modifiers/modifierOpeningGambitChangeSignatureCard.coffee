ModifierOpeningGambit = require './modifierOpeningGambit'
PlayerModifierEndTurnWatchRevertBBS = require 'app/sdk/playerModifiers/playerModifierEndTurnWatchRevertBBS'

class ModifierOpeningGambitChangeSignatureCard extends ModifierOpeningGambit

  type:"ModifierOpeningGambitChangeSignatureCard"
  @type:"ModifierOpeningGambitChangeSignatureCard"

  @modifierName:"Opening Gambit"
  @description:"Your Bloodbound Spell is %X"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  @createContextObject: (cardData, cardDescription) ->
    contextObject = super()
    contextObject.cardData = cardData
    contextObject.cardDescription = cardDescription
    return contextObject

  @getDescription: (modifierContextObject) ->
    return @description.replace /%X/, modifierContextObject.cardDescription

  onOpeningGambit: (action) ->
    super(action)

    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

    #If a revert bbs modifier exists from a temp BBS, remove it, new BBS overwrites it
    for modifier in general.getModifiersByClass(PlayerModifierEndTurnWatchRevertBBS)
      @getGameSession().removeModifier(modifier)

    general.setSignatureCardData(@cardData)
    @getGameSession().executeAction(general.getOwner().actionGenerateSignatureCard())

module.exports = ModifierOpeningGambitChangeSignatureCard
