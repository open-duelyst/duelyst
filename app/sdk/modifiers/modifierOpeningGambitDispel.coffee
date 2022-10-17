ModifierOpeningGambit =   require './modifierOpeningGambit'
CardType = require 'app/sdk/cards/cardType'
ModifierSilence = require './modifierSilence'
CONFIG = require('app/common/config')

class ModifierOpeningGambitDispel extends ModifierOpeningGambit

  type:"ModifierOpeningGambitDispel"
  @type:"ModifierOpeningGambitDispel"

  @modifierName:"Opening Gambit"
  @description:"Dispel ALL spaces around it"

  onOpeningGambit: () ->
    entities = @getGameSession().getBoard().getCardsWithinRadiusOfPosition(@getCard().getPosition(), CardType.Entity, 1, false, true)
    for entity in entities
      @getGameSession().applyModifierContextObject(ModifierSilence.createContextObject(), entity)

module.exports = ModifierOpeningGambitDispel
