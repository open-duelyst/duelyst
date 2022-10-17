ModifierOpeningGambitChangeSignatureCard = require './modifierOpeningGambitChangeSignatureCard'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierOpeningGambitGrandmasterVariax extends ModifierOpeningGambitChangeSignatureCard

  type:"ModifierOpeningGambitGrandmasterVariax"
  @type:"ModifierOpeningGambitGrandmasterVariax"

  @modifierName:"Opening Gambit"
  @description:"Your Bloodbound Spell costs 3 and is now AWESOME"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: (action) ->
    # choose signature spell to replace based on General
    if @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId()).getBaseCardId() is Cards.Faction4.AltGeneral
      @cardData = {id: Cards.Spell.SummonFiends}
    else if @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId()).getBaseCardId() is Cards.Faction4.ThirdGeneral
      @cardData = {id: Cards.Spell.SummonHusks}
    else #Lilithe's spell is more widely useful so make it default
      @cardData = {id: Cards.Spell.FuriousLings}
    super(action)

module.exports = ModifierOpeningGambitGrandmasterVariax
